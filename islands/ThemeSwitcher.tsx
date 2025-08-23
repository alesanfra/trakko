import { useEffect, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

const getInitialTheme = () => {
  if (IS_BROWSER) {
    return localStorage.getItem("theme") || "dark";
  }
  return "dark";
};

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (IS_BROWSER) {
      const root = document.documentElement;
      if (theme === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  if (!IS_BROWSER) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      class="fixed top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
      aria-label="Toggle theme"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
