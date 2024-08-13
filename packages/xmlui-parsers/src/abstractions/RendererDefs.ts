import type {ComponentDef} from "./ComponentDefs";
import type {LookupActionOptions} from "./ActionDefs";
import type {AsyncFunction} from "./FunctionDefs";

/**
 * This function updates the state of a component.
 * @param componentState The new state of the component
 */
export type UpdateStateFn = (componentState: any) => void;

/**
 * This type represent the function that extracts the value from a component property
 */
export type ValueExtractor = {
    /**
     * Get a value (any) from a component property
     * @param expression Value expression
     * @param strict Strict matching?
     */
    (expression?: any, strict?: boolean): any;

    /**
     * Get a string value from an expression
     * @param expression Value expression
     */
    asString(expression?: any): string;

    /**
     * Get an optional string value from an expression
     * @param expression Value expression
     */
    asOptionalString(expression?: any): string | undefined;

    /**
     * Get an optional string value from an expression
     * @param expression Value expression
     */
    asOptionalStringArray(expression?: any): string[];

    /**
     * Get a display string value from an expression
     * @param expression Value expression
     */
    asDisplayText(expression?: any): string;

    /**
     * Get a number value from an expression
     * @param expression Value expression
     */
    asNumber(expression?: any): number;

    /**
     * Get an optional number value from an expression
     * @param expression Value expression
     * @param defValue Default value, if the parameter value is undefined
     */
    asOptionalNumber(expression?: any, defValue?: number): number;

    /**
     * Get a boolean value (JavaScript semantics) from an expression
     * @param expression Value expression
     */
    asBoolean(expression?: any): boolean;

    /**
     * Get an optional Boolean value from an expression
     * @param expression Value expression
     * @param defValue Default value, if the parameter value is undefined
     */
    asOptionalBoolean(expression?: any, defValue?: boolean): boolean;

    /**
     * Get a CSS size value from an expression
     * @param expression Value expression
     */
    asSize(expression?: any): string;
};

/**
 * This function retrieves an async function for a particular component's specified event to be
 * invoked as an event handler (`undefined` if the particular event handler is not defined).
 */
export type LookupEventHandlerFn<T extends ComponentDef = ComponentDef> = (
    eventName: keyof NonNullable<T["events"]>,
    actionOptions?: LookupActionOptions
) => AsyncFunction | undefined;

/**
 * This type represents a function that registers all API endpoints of a particular component.
 */
export type RegisterComponentApiFn = (apiFn: Record<string, (...args: any[]) => void>) => void;

export type NonCssLayoutProps = {
    horizontalAlignment?: string;
    verticalAlignment?: string;
    orientation?: string;
};
