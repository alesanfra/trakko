import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { loadLocales, Translations } from "../locales/mod.ts";

export interface State {
  t: Translations;
}

const locales = await loadLocales();

export async function handler(
  req: Request,
  ctx: FreshContext<State>,
) {
  const lang = getLanguage(req, getCookies(req.headers));
  ctx.state.t = locales[lang as keyof typeof locales];
  const resp = await ctx.next();
  resp.headers.set("Content-Language", lang);
  return resp;
}

function getLanguage(req: Request, cookies: Record<string, string>): string {
  const { lang } = cookies;
  if (lang && lang in locales) {
    return lang;
  }
  const acceptLang = req.headers.get("accept-language");
  if (acceptLang) {
    const langs = acceptLang.split(",").map((l) => l.split(";")[0]);
    for (const l of langs) {
      if (l.startsWith("it")) return "it";
      if (l.startsWith("en")) return "en";
    }
  }
  return "en"; // default
}
