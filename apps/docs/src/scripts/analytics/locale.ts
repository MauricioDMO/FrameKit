import { LOCALE_STORAGE_KEY, getLocale, track } from './core';

export const initLocaleTracking = () => {
  const currentLocale = getLocale();
  const previousLocale = window.sessionStorage.getItem(LOCALE_STORAGE_KEY);

  if (previousLocale && previousLocale !== currentLocale) {
    track('language-change', {
      from: previousLocale,
      to: currentLocale,
    });
  }

  window.sessionStorage.setItem(LOCALE_STORAGE_KEY, currentLocale);
};
