export type ParamPrimitive = string | number | boolean;
export type RawParamValue = ParamPrimitive | null | undefined;
export type RawParams = Record<string, RawParamValue>;

export type StepPayloadValue = string | number | boolean | null;
export type StepPayload = Record<string, StepPayloadValue>;

export interface StepEventBase<
  TFamily extends string = string,
  TType extends string = string,
  TPayload extends StepPayload = StepPayload,
> {
  id: string;
  index: number;
  family: TFamily;
  type: TType;
  payload: TPayload;
}

export interface SearchStepEvent<
  TType extends string = string,
  TPayload extends StepPayload = StepPayload,
> extends StepEventBase<"search", TType, TPayload> {}

export type EngineGenerateOutput<TStep extends StepEventBase, TResult> = {
  steps: TStep[];
  result: TResult;
};

export interface AlgorithmEngine<
  TInput,
  TParams extends Record<string, ParamPrimitive>,
  TStep extends StepEventBase,
  TResult,
> {
  normalizeParams: (rawParams: RawParams) => TParams;
  normalizeInput: (rawInput: unknown, params: TParams) => TInput;
  generate: (input: TInput, params: TParams) => EngineGenerateOutput<TStep, TResult>;
}

export interface AlgorithmRunOutput<
  TInput,
  TParams extends Record<string, ParamPrimitive>,
  TStep extends StepEventBase,
  TResult,
> extends EngineGenerateOutput<TStep, TResult> {
  input: TInput;
  normalizedParams: TParams;
}
