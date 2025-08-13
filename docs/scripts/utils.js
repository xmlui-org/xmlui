export const XMLUI_STANDALONE_PATTERN = /xmlui-\d+\.\d+\.\d+\w*\.js/;

export function sortByVersion(a, b) {
  /** @type {string} */
  const versionStrA = a.tag_name.split("@")[1];
  /** @type {string} */
  const versionStrB = b.tag_name.split("@")[1];

  const [majorA, minorA, patchA] = versionStrA.split(".").map(Number);
  const [majorB, minorB, patchB] = versionStrB.split(".").map(Number);

  if (majorB !== majorA) {
    return majorB - majorA;
  }

  if (minorB !== minorA) {
    return minorB - minorA;
  }

  return patchB - patchA;
}
