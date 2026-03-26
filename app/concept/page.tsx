import { redirect } from "next/navigation";

/** `/concept` alone is easy to mistype — send people to the first screen. */
export default function ConceptIndexPage() {
  redirect("/concept/1");
}
