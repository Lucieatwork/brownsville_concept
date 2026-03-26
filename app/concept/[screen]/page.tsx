import { Screen1 } from "@/components/command-center/screens/screen-1";
import { redirect } from "next/navigation";

const VALID_SCREENS = new Set(["1", "2", "3", "4", "5", "6"]);

type PageProps = {
  params: Promise<{ screen: string }>;
};

export default async function ConceptScreenPage({ params }: PageProps) {
  const { screen } = await params;

  if (!VALID_SCREENS.has(screen)) {
    redirect("/concept/1");
  }

  if (screen === "1") {
    return <Screen1 />;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--shell-bg)] px-6 text-center">
      <p className="text-lg font-medium text-[var(--text-primary)]">
        Screen {screen}
      </p>
      <p className="max-w-sm text-sm text-[var(--text-muted)]">
        This concept screen is not built yet. Start from screen 1.
      </p>
    </div>
  );
}
