const cases = (window.CASE_STUDIES ?? []).filter((item) => item.published);
const grid = document.getElementById("case-grid");
const empty = document.getElementById("case-empty");

const escapeText = (value) => String(value ?? "");

if (cases.length) {
  empty.hidden = true;
  grid.hidden = false;
  cases.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "case-card";
    if (index === 0) article.classList.add("is-featured");
    if (item.image) {
      const figure = document.createElement("figure");
      figure.className = "case-image";
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = escapeText(item.imageAlt);
      image.loading = "lazy";
      image.width = 1280;
      image.height = 714;
      const caption = document.createElement("figcaption");
      caption.textContent = escapeText(item.imageCaption);
      figure.append(image, caption);
      article.append(figure);
    }
    const industry = document.createElement("span");
    industry.className = "case-industry";
    industry.textContent = escapeText(item.industry);
    const title = document.createElement("h3");
    title.textContent = escapeText(item.title);
    const list = document.createElement("dl");
    [["課題", item.challenge], ["実施したこと", item.action], ["結果", item.result]].forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = escapeText(value);
      row.append(term, detail);
      list.append(row);
    });
    const note = document.createElement("small");
    note.textContent = escapeText(item.note);
    article.append(industry, title, list, note);
    if (item.link) {
      const link = document.createElement("a");
      link.className = "case-link";
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `${escapeText(item.linkLabel)} ↗`;
      article.append(link);
    }
    grid.append(article);
  });
}
