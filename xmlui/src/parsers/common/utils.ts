export function deepFreeze (o: any) {
  Object.freeze(o);

  let oIsFunction = typeof o === "function";
  let hasOwnProp = Object.prototype.hasOwnProperty;

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (hasOwnProp.call(o, prop)
    && (oIsFunction ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments' : true )
    && o[prop] !== null
    && (typeof o[prop] === "object" || typeof o[prop] === "function")
    && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });
  
  return o;
};