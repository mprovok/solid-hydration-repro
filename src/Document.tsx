import type { JSX } from "@solidjs/web";
import { HydrationScript } from "@solidjs/web";

export default function Document(props: { children: JSX.Element }): JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>solid-js 2.0.3 hydration repro</title>
        <HydrationScript />
      </head>
      <body>{props.children}</body>
    </html>
  );
}
