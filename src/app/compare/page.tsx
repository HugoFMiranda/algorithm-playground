import type { Metadata } from "next";

import { CompareWorkbench } from "@/components/compare/compare-workbench";

export const metadata: Metadata = {
  title: "Compare Algorithms",
  description:
    "Compare deterministic default runs for implemented algorithms side by side by renderer family.",
};

export default function ComparePage() {
  return <CompareWorkbench />;
}
