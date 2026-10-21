const config = window.SITE_CONFIG ?? {};
if (config.operatorName) document.getElementById("operator-name").textContent = config.operatorName;
if (config.privacyContact) {
  document.getElementById("privacy-contact").textContent = config.privacyContact;
  document.getElementById("privacy-contact-link").href = `mailto:${config.privacyContact}`;
}
