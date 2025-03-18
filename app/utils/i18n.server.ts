import { createCookie } from '@remix-run/node';

// Define supported languages
export const LANGUAGES = {
  de: 'Deutsch',
  en: 'English',
};

export type Language = keyof typeof LANGUAGES;

// Create a cookie to store the user's language preference
export const languageCookie = createCookie('language', {
  maxAge: 31536000, // 1 year
});

// Get the user's language preference from the request
export async function getLanguage(request: Request): Promise<Language> {
  const cookieHeader = request.headers.get('Cookie');
  const language = await languageCookie.parse(cookieHeader);
  
  // Default to German if no language is set
  return (language as Language) || (process.env.DEFAULT_LANGUAGE as Language) || 'de';
}

// Load translations for a specific language
export async function loadTranslations(language: Language) {
  try {
    const translations = await import(`../i18n/${language}.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${language}`, error);
    // Fallback to German if translations can't be loaded
    const fallback = await import('../i18n/de.json');
    return fallback.default;
  }
}

// Get translations for the current request
export async function getTranslations(request: Request) {
  const language = await getLanguage(request);
  return loadTranslations(language);
}
