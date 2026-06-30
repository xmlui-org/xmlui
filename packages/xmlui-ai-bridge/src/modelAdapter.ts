import type { AgentRequest, XmluiAgentResponseEnvelope, XmluiValidationIssue } from "./contract";

export type GenerateOptions = {
  attempt: number;
  diagnostics?: XmluiValidationIssue[];
};

export type ModelAdapter = {
  generate(request: AgentRequest, options: GenerateOptions): Promise<XmluiAgentResponseEnvelope>;
};

export class FakeModelAdapter implements ModelAdapter {
  private readonly responses: XmluiAgentResponseEnvelope[];

  constructor(responses: XmluiAgentResponseEnvelope[] = [defaultFakeResponse]) {
    this.responses = responses;
  }

  async generate(_request: AgentRequest, options: GenerateOptions): Promise<XmluiAgentResponseEnvelope> {
    return this.responses[Math.min(options.attempt, this.responses.length - 1)];
  }
}

const defaultFakeResponse: XmluiAgentResponseEnvelope = {
  kind: "code",
  operation: "create",
  summary: "Generated starter XMLUI app.",
  code: "<App><Text>Hello from xmlui-ai-bridge</Text></App>",
};
