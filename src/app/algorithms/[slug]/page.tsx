import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AlgorithmPageShell } from "@/components/algorithm/algorithm-page-shell";
import { getAlgorithmBySlug } from "@/data/algorithms";

interface AlgorithmPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AlgorithmPageProps): Promise<Metadata> {
  const { slug } = await params;
  const algorithm = getAlgorithmBySlug(slug);

  if (!algorithm) {
    return {
      title: "Algorithm Not Found",
    };
  }

  return {
    title: algorithm.name,
    description: algorithm.shortDescription,
  };
}

export default async function AlgorithmPage({ params }: AlgorithmPageProps) {
  const { slug } = await params;
  const algorithm = getAlgorithmBySlug(slug);

  if (!algorithm) {
    notFound();
  }

  return <AlgorithmPageShell algorithm={algorithm} />;
}
