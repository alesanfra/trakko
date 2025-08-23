/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";
import { addValidSession } from "./_middleware.ts";

const ADMIN_PASSWORD = Deno.env.get("TRAKKO_ADMIN_PASSWORD") || "admin";
const SALT = "trakko-";
const COOKIE_NAME = "trakko_admin";

// Hash password with salt using SHA-256
async function hashPassword(password: string): Promise<string> {
  const saltedPassword = SALT + password;
  const encoder = new TextEncoder();
  const data = encoder.encode(saltedPassword);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate session token
function generateSessionToken(): string {
  const randomData = new Uint8Array(32);
  crypto.getRandomValues(randomData);
  return Array.from(randomData).map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const handler: Handlers = {
  async POST(req, _ctx) {
    const form = await req.formData();
    const password = form.get("password")?.toString();

    if (!password) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/admin?error=1" },
      });
    }

    const hashedPassword = await hashPassword(password);
    const expectedHash = await hashPassword(ADMIN_PASSWORD);

    if (hashedPassword === expectedHash) {
      const sessionToken = generateSessionToken();

      // Register the session token as valid
      addValidSession(sessionToken);

      const response = new Response(null, {
        status: 303,
        headers: { Location: "/admin/events" },
      });
      setCookie(response.headers, {
        name: COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: "Lax",
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return response;
    } else {
      return new Response(null, {
        status: 303,
        headers: { Location: "/admin?error=1" },
      });
    }
  },
};

export default function AdminLoginPage({ url }: { url?: URL }) {
  const hasError = url?.searchParams.get("error") === "1";
  const loggedOut = url?.searchParams.get("logout") === "1";

  return (
    <div class="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-4 flex items-center justify-center">
      <div class="w-full max-w-md">
        <h1 class="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-6 text-center">
          Admin Login
        </h1>
        <form
          method="POST"
          class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border-2 border-sky-500"
        >
          {loggedOut && (
            <div class="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 rounded">
              You have been successfully logged out.
            </div>
          )}
          {hasError && (
            <div class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
              <strong>Access Denied:</strong>{" "}
              The password you entered is incorrect. Please verify your password
              and try again.
            </div>
          )}
          <div class="mb-4">
            <label for="password" class="block text-lg font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              class="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
