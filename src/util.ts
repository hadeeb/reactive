const isSymbol = function(val: PropertyKey): val is symbol {
  return typeof val === "symbol";
};

export { isSymbol };
