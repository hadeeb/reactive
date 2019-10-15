function isObject(obj: any): obj is object {
  return obj !== null && typeof obj === "object";
}

function isArray(obj: any): obj is Array<any> {
  return Array.isArray(obj);
}

function isSymbol(val: PropertyKey): val is symbol {
  return typeof val === "symbol";
}

function hasOwn(obj: Object, prop: PropertyKey) {
  return obj.hasOwnProperty(prop);
}

export { isObject, isArray, isSymbol, hasOwn };
