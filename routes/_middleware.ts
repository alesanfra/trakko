import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";

import en from "../locales/en.json" with { type: "json" };
import it from "../locales/it.json" with { type: "json" };

const locales = { en, it };

export type Locales = keyof typeof locales;
export type Translations = typeof en;

export interface State {
  lang: Locales;
  t: Translations;
}

const langFromRequest = (req: Request): Locales => {
  const { lang } = getCookies(req.headers);
  if (lang && lang in locales) {
    return lang as Locales;
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
};

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const lang = langFromRequest(req);
  ctx.state.lang = lang;
  ctx.state.t = locales[lang];
  const resp = await ctx.next();
  resp.headers.set("Content-Language", lang);
  return resp;
}
