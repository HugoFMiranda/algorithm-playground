export type ExampleLanguage = "pseudocode" | "typescript";

export interface CodeExampleSnippet {
  id: string;
  label: string;
  language: ExampleLanguage;
  code: string;
}

export interface AlgorithmExamples {
  algorithmSlug: string;
  title: string;
  description: string;
  snippets: CodeExampleSnippet[];
}
