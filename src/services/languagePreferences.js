const languageKey = "fusha-language";

export function getSavedLanguage() {
  const savedLanguage = window.localStorage.getItem(languageKey)
    ?? window.localStorage.getItem("fusha-trips-language");

  return savedLanguage === "ar" ? "ar" : "en";
}

export function applyLanguage(language) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  window.localStorage.setItem(languageKey, language);
}
