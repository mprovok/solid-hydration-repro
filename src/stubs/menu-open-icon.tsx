import type { JSX } from "solid-js";

export default function MenuOpenIcon(props: { class?: string }): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden="true" class={props.class}>
      <path d="M157-191 60-288l102-102q-17-35-25.5-72.67Q128-500.35 128-540q0-145 103.5-242.5T480-880q145 0 242.5 97.5T820-540q0 145-97.5 242.5T480-200q-39 0-76-8.5T331-234L157-191Z" />
    </svg>
  );
}
