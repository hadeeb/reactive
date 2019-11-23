function isSymbol(val: PropertyKey): val is symbol {
  return typeof val === "symbol";
}

const ZERO = 0;
const ONE = 1;
const TWO = 2;

type OneofThree = typeof ZERO | typeof ONE | typeof TWO;

export { isSymbol, ZERO, ONE, TWO, OneofThree };
