export const WORK_TYPES = {
  estimate: {
    label: "見積・積算",
    firstStep: "過去の見積書を1か所に集め、よく使う項目をテンプレート化する",
    suggestions: ["見積書のひな形を統一", "過去案件の検索時間を短縮", "AIによる説明文の下書き"]
  },
  daily: {
    label: "日報・工事写真",
    firstStep: "音声入力による日報作成を、1現場だけで2週間試す",
    suggestions: ["音声から日報を下書き", "工事写真の命名ルールを統一", "帰社後の転記を削減"]
  },
  invoice: {
    label: "請求・入金確認",
    firstStep: "請求書の作成元を1つに決め、二重入力を洗い出す",
    suggestions: ["請求情報の入力元を統一", "入金確認の一覧化", "定型メールをテンプレート化"]
  },
  inquiry: {
    label: "物件・問い合わせ対応",
    firstStep: "よくある問い合わせ10件の返信文をテンプレート化する",
    suggestions: ["問い合わせ返信の下書き", "内見日程の調整を簡素化", "修繕依頼の受付項目を統一"]
  }
};

export const ROLES = {
  owner: "経営者・役員",
  manager: "管理職",
  field: "現場責任者",
  admin: "事務・管理担当",
  sales: "営業担当",
  other: "その他"
};

export const CHALLENGES = {
  afterwork: "帰社後の事務作業が多い",
  mixed: "紙・FAX・Excelが混在している",
  personal: "情報が担当者に属人化している",
  duplicate: "同じ内容を何度も入力している",
  documents: "見積や書類作成に時間がかかる",
  inquiries: "問い合わせ対応に追われている",
  ai: "AIを使いたいが、何から始めるか分からない",
  handover: "人手不足・引き継ぎに不安がある"
};

export const IDEAS_BY_CHALLENGE = {
  afterwork: "現場で音声入力し、帰社後は日報の確認だけにする",
  mixed: "紙・FAX・Excelのうち、まず1種類だけ保存先を統一する",
  personal: "担当者しか分からない手順を、AIで簡易マニュアルにする",
  duplicate: "同じ内容を入力している帳票を並べ、転記を1か所減らす",
  documents: "過去書類をひな形化し、説明文の下書きにAIを使う",
  inquiries: "よくある質問10件の回答案を作り、返信を下書きする",
  ai: "機密情報を使わない1業務を選び、2週間だけ試行する",
  handover: "ベテランの作業手順を聞き取り、引き継ぎ資料に整える"
};

export function calculateReport({ employees, weeklyHours, hourlyWage, workType, industry }) {
  const people = Number(employees);
  const hours = Number(weeklyHours);
  const wage = Number(hourlyWage);
  const task = WORK_TYPES[workType] ?? WORK_TYPES.daily;

  if (!Number.isFinite(people) || people < 1 || people > 500) throw new Error("従業員数が範囲外です");
  if (!Number.isFinite(hours) || hours < 0.5 || hours > 40) throw new Error("作業時間が範囲外です");
  if (!Number.isFinite(wage) || wage < 500 || wage > 10000) throw new Error("時給が範囲外です");

  const annualHours = Math.round(people * hours * 48);
  const annualCost = Math.round(annualHours * wage);
  const potentialHours = Math.round(annualHours * 0.3);
  const potentialCost = Math.round(annualCost * 0.3);

  return {
    industry: industry === "realestate" ? "不動産業" : "建設業",
    task,
    annualHours,
    annualCost,
    potentialHours,
    potentialCost,
    formula: `${people}人 × 週${hours}時間 × 48週 × ${wage.toLocaleString("ja-JP")}円`
  };
}
