/**
 * This utility function adds class names from CSS Modules to React components making it more readable to add multiple 
 * class styles to a single component.
 * @param input class names that should be concatenated
 * @returns Concatenated string of class names separated by a space
 */
export default function clsx(...input: (string | number | object | undefined)[]) {
  // filter falsy (null, undefined, "", false) values
  const args = input.filter(Boolean);
  let i = 0,
    tmp,
    x = "",
    str = "";
  while (i < args.length) {
    tmp = args[i++];
    if (tmp) {
      x = toVal(tmp);
      if (x) {
        str && (str += " ");
        str += x;
      }
    }
  }
  return str;

  /**
   * Converts the specified value to its string representation
   * @param mix
   */
  function toVal(mix: string | number | object): string {
    let k: any,
        y: string,
        str = "";

    if (typeof mix === "string" || typeof mix === "number") {
      str += mix;
    } else if (typeof mix === "object") {
      if (Array.isArray(mix)) {
        for (k = 0; k < mix.length; k++) {
          if (mix[k]) {
            y = toVal(mix[k]);
            if (y) {
              str && (str += " ");
              str += y;
            }
          }
        }
      } else {
        for (k in mix) {
          // @ts-ignore
          if (mix[k]) {
            str && (str += " ");
            str += k;
          }
        }
      }
    }

    return str;
  }
}
