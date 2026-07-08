export function orderedKeys(obj: object): Array<string | symbol> {
  const keys = Reflect.ownKeys(obj);
  const numeric: string[] = [];
  const strings: string[] = [];
  const symbols: symbol[] = [];

  for (const key of keys) {
    if (typeof key === "symbol") {
      symbols.push(key);
    } else if (isCanonicalNumericKey(key)) {
      numeric.push(key);
    } else {
      strings.push(key);
    }
  }

  numeric.sort((a, b) => Number(a) - Number(b));
  symbols.sort((a, b) => (a.description ?? "").localeCompare(b.description ?? ""));
  return [...numeric, ...strings, ...symbols];
}

function isCanonicalNumericKey(key: string): boolean {
  if (key.trim() === "") return false;
  const number = Number(key);
  return Number.isInteger(number) && number >= 0 && String(number) === key;
}
