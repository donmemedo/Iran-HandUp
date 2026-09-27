import en from "./en";
import fa from "./fa";
import { defaultLocale, type Locale, locales } from "./config";

export const dictionaries = { fa, en };
export const getDict = (locale: string) =>
  dictionaries[(locales as readonly string[]).includes(locale) ? (locale as Locale) : defaultLocale];
export { locales, defaultLocale, type Locale };
export { dir } from "./config";
