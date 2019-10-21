function isSymbol(val: PropertyKey): val is symbol {
  return typeof val === "symbol";
}

export { isSymbol };
