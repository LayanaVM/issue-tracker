import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Alumni+Sans+SC:wght@600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="antialiased font-alumni">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
