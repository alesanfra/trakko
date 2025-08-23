/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";
import { deleteCookie, getCookies } from "$std/http/cookie.ts";
import { removeValidSession } from "./_middleware.ts";

const COOKIE_NAME = "trakko_admin";

export const handler: Handlers = {
  GET(req, _ctx) {
    const cookies = getCookies(req.headers);
    const sessionToken = cookies[COOKIE_NAME];

    // Remove the session from valid sessions if it exists
    if (sessionToken) {
      removeValidSession(sessionToken);
    }

    // Clear the cookie and redirect to login
    const response = new Response(null, {
      status: 303,
      headers: { Location: "/admin?logout=1" },
    });

    deleteCookie(response.headers, COOKIE_NAME);

    return response;
  },
};
