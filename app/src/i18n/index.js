import en from './en.json';

const locales = {
  en
};

const defaultLocale = 'en';

const resolveLocale = (locale) => (locale && locales[locale] ? locale : defaultLocale);

const getMessage = (locale, key) =>
  key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), locales[locale]);

export const supportedLocales = Object.keys(locales);

export const getInitialLocale = () => {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }
  try {
    const stored = window.localStorage.getItem('gear-list-editor.locale');
    if (stored) {
      return resolveLocale(stored);
    }
  } catch {
    // Ignore storage errors.
  }
  const browserLocale = window.navigator?.language?.split('-')[0];
  return resolveLocale(browserLocale);
};

export const storeLocale = (locale) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem('gear-list-editor.locale', locale);
  } catch {
    // Ignore storage errors.
  }
};

export const createTranslator = (locale) => {
  const safeLocale = resolveLocale(locale);
  return (key, vars = {}) => {
    const message = getMessage(safeLocale, key);
    if (message === undefined || message === null) {
      return key;
    }
    if (Array.isArray(message)) {
      return message;
    }
    if (typeof message !== 'string') {
      return message;
    }
    return message.replace(/\{(\w+)\}/g, (match, token) => {
      if (vars[token] === undefined || vars[token] === null) {
        return match;
      }
      return String(vars[token]);
    });
  };
};

export const createListTranslator = (locale) => {
  const safeLocale = resolveLocale(locale);
  return (key) => {
    const message = getMessage(safeLocale, key);
    return Array.isArray(message) ? message : [];
  };
};
