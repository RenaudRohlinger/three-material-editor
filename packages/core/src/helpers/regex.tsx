/**
 * Regular expression for matching the `void main() {` opener line in GLSL.
 * @type {RegExp}
 */
export const voidMainRegExp: any = /\bvoid\s+main\s*\(\s*\)\s*{/g;

export const commentedIncludeRegExp: any = /^(\s*)\/\/ #include <([a-zA-Z0-9_]+)>/gm;

export const includeRegExp: any = /^(\s*)#include <([a-zA-Z0-9_]+)>/gm;

export function getMainExtents(text: string) {
  const mainRegex = /void\s*main\s*\(.*?\)[\s\S]*?\{/g;
  const mainResult = mainRegex.exec(text);

  if (!mainResult) {
    return null;
  }

  const braceRegex = /[{}]/g;
  braceRegex.lastIndex = mainRegex.lastIndex + mainResult[0].length;

  const before = mainRegex.lastIndex - mainResult[0].length;
  const after = mainRegex.lastIndex;
  let end = 0;

  let braceCount = 1;
  let lastResult;
  while ((lastResult = braceRegex.exec(text))) {
    const brace = lastResult[0];
    if (brace === '{') {
      braceCount++;
    } else {
      braceCount--;
      if (braceCount === 0) {
        end = lastResult.index - 1;
        break;
      }
    }
  }

  return { before, after, end };
}
