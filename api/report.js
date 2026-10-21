import { calculateReport, WORK_TYPES, ROLES, CHALLENGES, IDEAS_BY_CHALLENGE } from "../lib/report.js";

const json = (response, status, body) => response.status(status).json(body);
const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const formatYen = (value) => `${Math.round(value / 10000).toLocaleString("ja-JP")}万円`;

function reportEmail(report, lead, deadline) {
  const ideaList = [...lead.challenges.map((item) => IDEAS_BY_CHALLENGE[item]), ...report.task.suggestions];
  const ideas = [...new Set(ideaList)].slice(0, 3);
  const suggestions = ideas.map((item) => `<li style="margin:8px 0">${escapeHtml(item)}</li>`).join("");
  const challenges = lead.challenges.map((item) => `<li style="margin:5px 0">${escapeHtml(CHALLENGES[item])}</li>`).join("");
  return `
  <div style="max-width:620px;margin:0 auto;padding:32px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans JP',sans-serif;color:#17332b;line-height:1.8">
    <p style="font-size:13px;color:#e86035;margin:0 0 8px">にいがた仕事改善室</p>
    <h1 style="font-size:24px;line-height:1.45;margin:0 0 20px">${escapeHtml(lead.companyName)}様の<br>業務改善可能性レポート</h1>
    <p>60秒・手作業コストチェックをご利用いただき、ありがとうございます。</p>
    <div style="background:#f5f7f3;border-radius:12px;padding:20px;margin:24px 0">
      <p style="margin:0 0 6px;color:#60716b;font-size:13px">年間の手作業時間</p>
      <p style="margin:0;font-size:24px;font-weight:700">${report.annualHours.toLocaleString("ja-JP")}時間</p>
      <p style="margin:16px 0 6px;color:#60716b;font-size:13px">年間の手作業コスト</p>
      <p style="margin:0;font-size:24px;font-weight:700">約${formatYen(report.annualCost)}</p>
    </div>
    <p style="font-size:13px;color:#60716b">計算式：${escapeHtml(report.formula)}</p>
    <h2 style="font-size:18px;margin-top:30px">お聞きした課題</h2>
    <ul>${challenges}</ul>
    <h2 style="font-size:18px;margin-top:30px">最初の一手</h2>
    <p><strong>${escapeHtml(report.task.firstStep)}</strong></p>
    <h2 style="font-size:18px;margin-top:30px">改善可能性のある3項目</h2>
    <ol>${suggestions}</ol>
    <div style="border-left:4px solid #e86035;padding:4px 0 4px 16px;margin:30px 0">
      <p style="margin:0"><strong>${escapeHtml(deadline)}まで、新潟県内で直接サポートできます。</strong></p>
      <p style="margin:6px 0 0;color:#60716b">実際の見積書や日報を見ながら、最初に改善する1業務を一緒に整理します。</p>
    </div>
    <p style="font-size:12px;color:#60716b">本レポートは入力内容に基づく概算です。実際の削減効果を保証するものではありません。</p>
  </div>`;
}

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "POSTのみ利用できます" });

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const email = String(body?.email ?? "").trim().toLowerCase();
    const companyName = String(body?.companyName ?? "").replace(/[\r\n]+/g, " ").trim();
    const role = String(body?.role ?? "");
    const challenges = Array.isArray(body?.challenges) ? [...new Set(body.challenges.map(String))] : [];
    const detail = String(body?.detail ?? "").trim();
    const honeypot = String(body?.companyWebsite ?? "").trim();
    const deadline = process.env.SUPPORT_DEADLINE || "2027年1月31日";

    if (honeypot) return json(response, 200, { ok: true });
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) return json(response, 400, { error: "メールアドレスを確認してください" });
    if (!companyName || companyName.length > 120) return json(response, 400, { error: "会社名を入力してください" });
    if (!ROLES[role]) return json(response, 400, { error: "立場を選択してください" });
    if (challenges.length < 1 || challenges.length > 2 || challenges.some((item) => !CHALLENGES[item])) return json(response, 400, { error: "現在の課題を1〜2つ選択してください" });
    if (detail.length > 500) return json(response, 400, { error: "自由記述は500文字以内で入力してください" });
    if (!body?.privacyAccepted) return json(response, 400, { error: "プライバシーポリシーへの同意が必要です" });
    if (!WORK_TYPES[body?.workType]) return json(response, 400, { error: "対象業務を選択してください" });

    const report = calculateReport(body);
    const lead = { companyName, role, challenges, detail };
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.REPORT_FROM_EMAIL;
    const owner = process.env.OWNER_EMAIL;
    if (!apiKey || !from) return json(response, 503, { error: "メール送信設定が完了していません" });

    const userMail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        reply_to: owner || undefined,
        subject: `【にいがた仕事改善室】${companyName}様の業務改善可能性レポート`,
        html: reportEmail(report, lead, deadline)
      })
    });
    if (!userMail.ok) throw new Error("メール送信に失敗しました");

    if (owner) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [owner],
          reply_to: email,
          subject: `【改善レポート申込】${companyName}／${report.task.label}`,
          html: `<p>業務改善可能性レポートの申込がありました。</p><ul><li>会社名：${escapeHtml(companyName)}</li><li>メール：${escapeHtml(email)}</li><li>立場：${escapeHtml(ROLES[role])}</li><li>業種：${escapeHtml(report.industry)}</li><li>対象業務：${escapeHtml(report.task.label)}</li><li>現在の課題：${challenges.map((item) => escapeHtml(CHALLENGES[item])).join("／")}</li><li>自由記述：${escapeHtml(detail || "なし")}</li><li>年間手作業時間：${report.annualHours.toLocaleString("ja-JP")}時間</li><li>年間手作業コスト：約${formatYen(report.annualCost)}</li></ul>`
        })
      });
    }

    return json(response, 200, { ok: true });
  } catch (error) {
    console.error(error);
    return json(response, 500, { error: "レポートを送信できませんでした。時間をおいてお試しください" });
  }
}
