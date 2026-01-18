import { useCallback, useEffect, useMemo, useState } from 'react';
import en from './en.json';

const translations = { en };
const DEFAULT_LOCALE = 'en';
const STORAGE_KEY = 'gear-list-editor.locale';

const normalizeLocale = (value) => {
  if (!value) {
    return DEFAULT_LOCALE;
  }
  const lower = value.toLowerCase();
  if (translations[lower]) {
    return lower;
  }
  const short = lower.split('-')[0];
  if (translations[short]) {
    return short;
  }
  return DEFAULT_LOCALE;
};

const getInitialLocale = () => {
  if (typeof localStorage !== 'undefined') {
    const stored = normalizeLocale(localStorage.getItem(STORAGE_KEY));
    if (stored) {
      return stored;
    }
  }
  if (typeof navigator !== 'undefined') {
    return normalizeLocale(navigator.language);
  }
  return DEFAULT_LOCALE;
};

export const useI18n = () => {
  const [locale, setLocale] = useState(getInitialLocale);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  const t = useCallback(
    (key, variables = {}) => {
      const template =
        translations[locale]?.[key] ?? translations[DEFAULT_LOCALE]?.[key] ?? key;
      return template.replace(/\{(\w+)\}/g, (match, name) =>
        Object.prototype.hasOwnProperty.call(variables, name)
          ? String(variables[name])
          : match
      );
    },
    [locale]
  );

  const locales = useMemo(
    () =>
      Object.keys(translations).map((code) => ({
        code,
        label: translations[code]?.['language.name'] || code
      })),
    []
  );

  return {
    locale,
    locales,
    setLocale,
    t
  };
};
