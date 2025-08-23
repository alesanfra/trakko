import { AppProps } from "$fresh/server.ts";
import { State } from "./_middleware.ts";
import ThemeSwitcher from "../islands/ThemeSwitcher.tsx";

export default function App({ Component, state }: AppProps<State>) {
  return (
    <html lang={state.lang as string}>
      <head>
        <meta charset="utf-t-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Trakko</title>
        <link rel="stylesheet" href="/styles.css" />
        <script>
          {`
            const theme = localStorage.getItem('theme') || 'dark';
            document.documentElement.classList.add(theme);
          `}
        </script>
      </head>
      <body>
        <ThemeSwitcher />
        <Component />
      </body>
    </html>
  );
}
