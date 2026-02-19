"use client";

import { useState } from "react";
import { CheckIcon, Code2Icon, CopyIcon } from "lucide-react";

import { getAlgorithmExamplesBySlug } from "@/algorithms/examples/registry";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImplementationExamplesProps {
  algorithmSlug: string;
  className?: string;
}

export function ImplementationExamples({ algorithmSlug, className }: ImplementationExamplesProps) {
  const content = getAlgorithmExamplesBySlug(algorithmSlug);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  if (!content) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Implementation Examples</CardTitle>
            <Badge variant="outline" className="rounded-full border-border/70">
              Placeholder
            </Badge>
          </div>
          <CardDescription>
            Abstracted code examples are not available for this algorithm yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const defaultSnippet = content.snippets[0];

  const handleCopy = async (snippetId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedSnippetId(snippetId);
      window.setTimeout(() => {
        setCopiedSnippetId((current) => (current === snippetId ? null : current));
      }, 1200);
    } catch {
      setCopiedSnippetId(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{content.title}</CardTitle>
          <Badge variant="outline" className="rounded-full border-border/70">
            Pseudocode + TypeScript
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">{content.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultSnippet.id} className="gap-3">
          <TabsList className="w-full justify-start">
            {content.snippets.map((snippet) => (
              <TabsTrigger key={snippet.id} value={snippet.id} className="flex-none">
                <Code2Icon className="size-3.5" />
                {snippet.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {content.snippets.map((snippet) => (
            <TabsContent key={snippet.id} value={snippet.id}>
              <div className="overflow-hidden rounded-lg border border-border/80 bg-zinc-950">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                  <Badge variant="secondary" className="rounded-full bg-white/10 text-[10px] text-zinc-100">
                    {snippet.language}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className={cn(
                      "text-zinc-200 hover:bg-white/10 hover:text-white",
                      copiedSnippetId === snippet.id && "text-emerald-300",
                    )}
                    onClick={() => handleCopy(snippet.id, snippet.code)}
                  >
                    {copiedSnippetId === snippet.id ? (
                      <CheckIcon className="size-3.5" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                    {copiedSnippetId === snippet.id ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-100 sm:text-[13px]">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
