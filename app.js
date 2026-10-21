import { calculateReport } from "/lib/report.js";

const config = window.SITE_CONFIG ?? {};
const state = { industry: "construction", workType: "daily", report: null, challenges: [] };
const number = new Intl.NumberFormat("ja-JP");

document.querySelectorAll('[data-config="supportDeadline"]').forEach((element) => {
  if (config.supportDeadline) element.textContent = config.supportDeadline;
});

document.querySelectorAll(".booking-link").forEach((link) => {
  if (config.bookingUrl) {
    link.href = config.bookingUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.firstChild.textContent = "15分相談を予約する ";
  }
});

document.querySelectorAll("[data-field]").forEach((button) => {
  button.addEventListener("click", () => {
    const field = button.dataset.field;
    state[field] = button.dataset.value;
    document.querySelectorAll(`[data-field="${field}"]`).forEach((peer) => {
      const selected = peer === button;
      peer.classList.toggle("is-selected", selected);
      peer.setAttribute("aria-pressed", String(selected));
    });
  });
});

document.querySelectorAll("[data-challenge]").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.challenge;
    const selected = state.challenges.includes(value);
    if (selected) {
      state.challenges = state.challenges.filter((item) => item !== value);
    } else if (state.challenges.length < 2) {
      state.challenges = [...state.challenges, value];
    } else {
      const error = document.getElementById("challenge-error");
      error.textContent = "課題は2つまで選択できます";
      return;
    }
    button.classList.toggle("is-selected", !selected);
    button.setAttribute("aria-pressed", String(!selected));
    document.getElementById("challenge-error").textContent = "";
  });
});

const employees = document.getElementById("employees");
const weeklyHours = document.getElementById("weekly-hours");
const hourlyWage = document.getElementById("hourly-wage");

function syncRanges() {
  document.getElementById("employees-output").textContent = number.format(employees.value);
  document.getElementById("hours-output").textContent = number.format(weeklyHours.value);
  document.getElementById("wage-output").textContent = number.format(hourlyWage.value);
}
[employees, weeklyHours, hourlyWage].forEach((input) => input.addEventListener("input", syncRanges));

document.getElementById("diagnosis-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.report = calculateReport({
    industry: state.industry,
    workType: state.workType,
    employees: employees.value,
    weeklyHours: weeklyHours.value,
    hourlyWage: hourlyWage.value
  });

  document.getElementById("annual-hours").textContent = number.format(state.report.annualHours);
  document.getElementById("annual-cost").textContent = number.format(Math.round(state.report.annualCost / 10000));
  document.getElementById("potential-cost").textContent = number.format(Math.round(state.report.potentialCost / 10000));
  document.getElementById("result-formula").textContent = `計算：${state.report.formula}`;
  document.getElementById("first-step-text").textContent = state.report.task.firstStep;

  const section = document.getElementById("result");
  section.hidden = false;
  requestAnimationFrame(() => section.scrollIntoView({ behavior: "smooth", block: "start" }));
});

document.getElementById("email-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const message = document.getElementById("form-message");
  if (!state.report) return;
  if (state.challenges.length < 1) {
    document.getElementById("challenge-error").textContent = "現在の課題を1つ以上選択してください";
    document.querySelector(".challenge-fieldset").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  button.disabled = true;
  button.textContent = "送信しています…";
  message.textContent = "";
  message.className = "form-message";

  try {
    const response = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: document.getElementById("company-name").value,
        role: document.getElementById("role").value,
        challenges: state.challenges,
        detail: document.getElementById("detail").value,
        email: document.getElementById("email").value,
        companyWebsite: document.getElementById("company-website").value,
        privacyAccepted: document.getElementById("privacy-accepted").checked,
        industry: state.industry,
        workType: state.workType,
        employees: employees.value,
        weeklyHours: weeklyHours.value,
        hourlyWage: hourlyWage.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "送信に失敗しました");

    message.textContent = "改善可能性レポートを送信しました。メールをご確認ください。";
    message.classList.add("is-success");
    form.reset();
    button.textContent = "送信しました";
  } catch (error) {
    message.textContent = error.message;
    message.classList.add("is-error");
    button.disabled = false;
    button.innerHTML = "改善アイデア3つを受け取る <span>→</span>";
  }
});

syncRanges();
