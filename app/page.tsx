import { Screen1 } from "@/components/command-center/screens/screen-1";

/**
 * Same view as `/concept/1` without a redirect — some browsers and in-editor
 * previews handle this more reliably than a 307 to `/concept/1`.
 */
export default function Home() {
  return <Screen1 />;
}
