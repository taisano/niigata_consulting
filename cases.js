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
    if (item.slug) article.id = item.slug;
    if (item.featured || index === 0) article.classList.add("is-featured");
    if (Array.isArray(item.images) && item.images.length) {
      const gallery = document.createElement("div");
      gallery.className = "case-gallery";
      gallery.setAttribute("aria-label", `${escapeText(item.title)}の関連画像`);
      item.images.forEach((asset) => {
        const figure = document.createElement("figure");
        const link = document.createElement("a");
        link.href = asset.src;
        link.target = "_blank";
        link.rel = "noopener";
        link.setAttribute("aria-label", `${escapeText(asset.caption)}を拡大表示`);
        const image = document.createElement("img");
        image.src = asset.src;
        image.alt = escapeText(asset.alt);
        image.loading = "lazy";
        image.decoding = "async";
        const caption = document.createElement("figcaption");
        caption.textContent = escapeText(asset.caption);
        link.append(image);
        figure.append(link, caption);
        gallery.append(figure);
      });
      article.append(gallery);
    }
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
    const client = item.client ? document.createElement("p") : null;
    if (client) {
      client.className = "case-client";
      client.textContent = `クライアント：${escapeText(item.client)}`;
    }
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
    article.append(industry);
    if (client) article.append(client);
    article.append(title, list, note);
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
