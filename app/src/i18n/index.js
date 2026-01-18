import { useCallback, useMemo, useState } from 'react';
import en from './en.json';
import de from './de.json';

const LOCALE_STORAGE_KEY = 'gear-list-editor.locale';
const DICTIONARIES = { en, de };

const resolveLocaleLabel = (locale) => DICTIONARIES[locale]?.meta?.label || locale;

export const getDictionary = (locale) => DICTIONARIES[locale] || DICTIONARIES.en;

const resolveBrowserLocale = () => {
  if (typeof navigator === 'undefined') {
    return 'en';
  }
  const language = navigator.language || navigator.userLanguage || 'en';
  const normalized = language.toLowerCase().split('-')[0];
  return DICTIONARIES[normalized] ? normalized : 'en';
};

const readStoredLocale = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeStoredLocale = (locale) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage errors; locale will fall back to browser defaults.
  }
};

const resolveTranslation = (dictionary, key) => {
  if (!dictionary || !key) {
    return undefined;
  }
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dictionary);
};

const interpolate = (value, variables) => {
  if (!variables) {
    return value;
  }
  return value.replace(/\{(\w+)\}/g, (match, token) => {
    if (Object.prototype.hasOwnProperty.call(variables, token)) {
      return String(variables[token]);
    }
    return match;
  });
};

const resolvePluralForm = (count) => (count === 1 ? 'one' : 'other');

export const translate = (dictionary, key, fallback, variables) => {
  const resolved = resolveTranslation(dictionary, key);
  if (resolved === undefined || resolved === null) {
    return fallback ?? key;
  }
  if (typeof resolved === 'string') {
    return interpolate(resolved, variables);
  }
  return resolved;
};

export const translatePlural = (dictionary, key, count, fallback, variables) => {
  const resolved = resolveTranslation(dictionary, key);
  const form = resolvePluralForm(count);
  if (resolved && typeof resolved === 'object') {
    const template = resolved[form] ?? resolved.other ?? resolved.one;
    if (typeof template === 'string') {
      return interpolate(template, { count, ...variables });
    }
  }
  if (typeof resolved === 'string') {
    return interpolate(resolved, { count, ...variables });
  }
  if (fallback) {
    return interpolate(fallback, { count, ...variables });
  }
  return key;
};

const getInitialLocale = () => {
  const stored = readStoredLocale();
  if (stored && DICTIONARIES[stored]) {
    return stored;
  }
  return resolveBrowserLocale();
};

export const useI18n = () => {
  const [locale, setLocaleState] = useState(getInitialLocale);
  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  const setLocale = useCallback((nextLocale) => {
    if (!DICTIONARIES[nextLocale]) {
      return;
    }
    setLocaleState(nextLocale);
    writeStoredLocale(nextLocale);
  }, []);

  const t = useCallback(
    (key, fallback, variables) => translate(dictionary, key, fallback, variables),
    [dictionary]
  );
  const tPlural = useCallback(
    (key, count, fallback, variables) =>
      translatePlural(dictionary, key, count, fallback, variables),
    [dictionary]
  );

  const locales = useMemo(
    () =>
      Object.keys(DICTIONARIES).map((code) => ({
        code,
        label: resolveLocaleLabel(code)
      })),
    []
  );

  return {
    locale,
    locales,
    setLocale,
    t,
    tPlural
  };
};
