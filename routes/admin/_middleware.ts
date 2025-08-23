/// <reference lib="deno.unstable" />
import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { State } from "../_middleware.ts";
import it from "../../locales/it.json" with { type: "json" };
import en from "../../locales/en.json" with { type: "json" };

const COOKIE_NAME = "trakko_admin";

// Store valid session tokens in memory (in production, use a database or Redis)
const validSessions = new Set<string>();

// Helper function to validate session token
function isValidSession(sessionToken: string | undefined): boolean {
  if (!sessionToken) return false;
  // Check if it's a valid hex string of 64 characters (32 bytes)
  const isValidFormat = /^[a-f0-9]{64}$/i.test(sessionToken);
  return isValidFormat && validSessions.has(sessionToken);
}

// Export function to add session tokens (called from login page)
export function addValidSession(sessionToken: string): void {
  validSessions.add(sessionToken);
}

// Export function to remove session tokens (called from logout page)
export function removeValidSession(sessionToken: string): void {
  validSessions.delete(sessionToken);
}

const locales = { en, it };

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

export async function handler(
  req: Request,
  ctx: FreshContext<State>,
) {
  if (ctx.destination !== "route") {
    return await ctx.next();
  }

  // Load translations for admin pages
  const cookies = getCookies(req.headers);
  const lang = getLanguage(req, cookies);
  ctx.state.t = locales[lang as keyof typeof locales];

  const { pathname } = new URL(req.url);
  const isAdmin = isValidSession(cookies[COOKIE_NAME]);

  const onLoginPage = pathname === "/admin" || pathname === "/admin/";

  // If user is logged in and tries to access the login page, redirect to dashboard
  if (isAdmin && onLoginPage) {
    return new Response(null, {
      status: 307, // Use 307 for temporary redirect
      headers: { Location: "/admin/events" },
    });
  }

  // If user is not logged in and tries to access a protected page, redirect to login
  if (!isAdmin && !onLoginPage) {
    return new Response(null, {
      status: 307,
      headers: { Location: "/admin" },
    });
  }

  // Otherwise, allow access
  return await ctx.next();
}
