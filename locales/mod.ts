import it from "./it.json" with { type: "json" };
import en from "./en.json" with { type: "json" };

export type Translations = typeof it;
export type Locales = keyof typeof locales;

const locales = {
  en,
  it,
};

export async function loadLocales(): Promise<Record<Locales, Translations>> {
  return await Promise.resolve(locales);
}
