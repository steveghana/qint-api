import i18next, { TFunction } from 'i18next';
import Backend from 'i18next-node-fs-backend';
import { LanguageDetector } from 'i18next-express-middleware';

const supportedLanguages = ['en', 'he'] as const;
const fallbackLanguage = 'en';

export type Language = (typeof supportedLanguages)[number];

export function getInitialLanguage(): Language {
  const defaultLanguage = 'he';

  try {
    const storedLanguagePreference =
      window &&
      window.localStorage &&
      (window.localStorage.getItem('preferredLanguage') as Language);
    if (
      storedLanguagePreference &&
      supportedLanguages.includes(storedLanguagePreference)
    ) {
      return storedLanguagePreference;
    }

    const navigatorLanguage = navigator && navigator.language;
    const userPreferredLanguage =
      navigatorLanguage &&
      (navigatorLanguage.split('-')[0].toLowerCase() as Language);
    if (
      userPreferredLanguage &&
      supportedLanguages.includes(userPreferredLanguage)
    ) {
      return userPreferredLanguage;
    }
  } catch (_e) {
    /* Do nothing */
  }

  return defaultLanguage;
}

export type LanguageChangeListener = (
  languageCode: Language,
  t: TFunction,
) => void;

export type Context = {
  languageChangeListeners: LanguageChangeListener[];
};

export const globalContext: Context = {
  languageChangeListeners: [],
};

async function initialize(): Promise<void> {
  try {
    if (i18next) {
      await i18next
        .use(Backend)
        .use(LanguageDetector)
        .init({
          fallbackLng: fallbackLanguage,
          supportedLngs: supportedLanguages,
          preload: supportedLanguages,
          backend: {
            loadPath: 'src/apps/util/locale/{{lng}}.json',
          },
          debug: true,
        });
    }
  } catch (e) {
    console.error('Error initializing i18next:', e);
  }
}

async function setLanguage(
  languageCode: Language,
  context: Context = globalContext,
): Promise<void> {
  const t = await i18next.changeLanguage(languageCode);
  if (window && window.localStorage) {
    window.localStorage.setItem('preferredLanguage', languageCode);
  }
  context.languageChangeListeners.forEach((listener) =>
    listener(languageCode, t),
  );
}

function getLanguage(): Language {
  return i18next.language as Language;
}

function getDirection(): 'rtl' | 'ltr' {
  const isRtl = (languageCode: Language) => languageCode === 'he';
  return isRtl(getLanguage()) ? 'rtl' : 'ltr';
}

async function getStaticTranslationNamespace(
  namespaceName: string,
): Promise<TFunction> {
  await initialize();
  const jsonFile = await import(`../locale/en.json`);
  i18next.init();
  const i18n = i18next.createInstance();
  const { hasResourceBundle } = i18n;

  if (!i18n.hasResourceBundle(i18n.language, namespaceName)) {
    i18n.addResourceBundle(i18n.language, namespaceName, jsonFile);
  }

  await i18n.loadNamespaces(namespaceName);

  return i18n.getFixedT(null, namespaceName);
}

function addLanguageChangeListener(
  listener: LanguageChangeListener,
  context = globalContext,
): void {
  context.languageChangeListeners.push(listener);
}

function removeLanguageChangeListener(
  listener: LanguageChangeListener,
  context = globalContext,
): void {
  const index = context.languageChangeListeners.findIndex(
    (l) => l === listener,
  );
  if (index === -1) {
    return;
  }
  context.languageChangeListeners.splice(index, 1);
}

export default {
  initialize,
  setLanguage,
  getLanguage,
  getDirection,
  getStaticTranslationNamespace,
  addLanguageChangeListener,
  removeLanguageChangeListener,
};
