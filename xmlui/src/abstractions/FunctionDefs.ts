// XMLUI executes its code asynchronously. This type defines functions that can be 
// used in XMLUI as actions or event handlers.
export type AsyncFunction = (...args: any) => Promise<any> | any;

// XMLUI executes some code synchronously. This type defines those functions' signature
export type SyncFunction = (...args: any) => any;
