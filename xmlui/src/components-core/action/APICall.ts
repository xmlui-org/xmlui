import { managedFetchService } from "../../runtime/data";

type LegacyCallApiNode = {
  props?: Record<string, unknown>;
};

type LegacyCallApiContext = Record<string, unknown>;
type LegacyCallApiOptions = Record<string, unknown> & {
  onResponseHeaders?: (headers: Record<string, string> | undefined) => void;
};

export async function callApi(
  nodeOrOptions: LegacyCallApiNode | Record<string, unknown>,
  _executionContext?: LegacyCallApiOptions,
  _stateContext?: Record<string, unknown>,
): Promise<unknown> {
  const input = "props" in nodeOrOptions && nodeOrOptions.props
    ? nodeOrOptions.props
    : nodeOrOptions;
  const response = await managedFetchService.execute(managedFetchService.buildRequest(input));
  _executionContext?.onResponseHeaders?.(response.headers);
  return response.data;
}
