function isArray(obj: any): obj is Array<any> {
  return Array.isArray(obj);
}

function isSymbol(val: PropertyKey): val is symbol {
  return typeof val === "symbol";
}

export { isArray, isSymbol };
