import test from "node:test";
import assert from "node:assert/strict";
import { calculateReport } from "../lib/report.js";
import handler from "../api/report.js";

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test("標準ケースの年間時間とコストを計算する", () => {
  const report = calculateReport({ employees: 12, weeklyHours: 4, hourlyWage: 1800, workType: "daily", industry: "construction" });
  assert.equal(report.annualHours, 2304);
  assert.equal(report.annualCost, 4147200);
  assert.equal(report.potentialCost, 1244160);
  assert.equal(report.industry, "建設業");
});

test("不正な入力を拒否する", () => {
  assert.throws(() => calculateReport({ employees: 0, weeklyHours: 4, hourlyWage: 1800, workType: "daily" }));
});

test("メールAPIは不正なメールアドレスを拒否する", async () => {
  const response = mockResponse();
  await handler({ method: "POST", body: { email: "invalid", privacyAccepted: true, workType: "daily" } }, response);
  assert.equal(response.statusCode, 400);
});

test("メールAPIは課題未選択を拒否する", async () => {
  const response = mockResponse();
  await handler({ method: "POST", body: {
    email: "test@example.jp",
    companyName: "株式会社テスト",
    role: "owner",
    challenges: [],
    privacyAccepted: true,
    workType: "daily"
  } }, response);
  assert.equal(response.statusCode, 400);
});

test("メール設定前は503を返す", async () => {
  const response = mockResponse();
  await handler({ method: "POST", body: {
    email: "test@example.jp",
    companyName: "株式会社テスト",
    role: "owner",
    challenges: ["afterwork"],
    privacyAccepted: true,
    workType: "daily",
    industry: "construction",
    employees: 12,
    weeklyHours: 4,
    hourlyWage: 1800
  } }, response);
  assert.equal(response.statusCode, 503);
});
