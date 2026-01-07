/**
 * Components can provide an API that other components can invoke (using
 * the host component ID). This type defines the shape of a hash object that
 * stores the API endpoints.
 */
export type ComponentApi = Record<string, ((...args: any[]) => any) | boolean | number | string>;
