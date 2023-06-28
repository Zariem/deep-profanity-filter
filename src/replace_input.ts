const grawlixSymbols = '%&$#?£@!';

/**
 * Transforms the full input string into so-called 'grawlix' (`%&$#?£@!`) characters.
 * @param inputString - The text we want to be turned into grawlix characters.
 * @returns The text, transformed into a mess of `%&$#?£@!` characters.
 * Simple whitespace will be preserved.
 */
export const grawlix = (inputString: string): string => {
  let outString = '';
  let lastCharacter = '';
  for (let i = 0; i < inputString.length; i++) {
    if (inputString.charAt(i).match(/[^a-zA-Z0-9]/g)) {
      outString += inputString.charAt(i);
    } else {
      let symbolIndex = inputString.charCodeAt(i) % grawlixSymbols.length;
      if (lastCharacter === grawlixSymbols[symbolIndex]) {
        symbolIndex = (symbolIndex + 1) % grawlixSymbols.length;
      }
      outString += grawlixSymbols[symbolIndex];
      lastCharacter = grawlixSymbols[symbolIndex];
    }
  }
  return outString;
};

/**
 * Replaces the full input strings with a repetition of the replacement character, but preserves
 * simple whitespace.
 * @param inputString - The text that we want to replace with the replacement character.
 * @param replacementCharacter - The character that we want to replace it with. If a string of
 * `length > 1` is provided, it will only use the first character.
 * @returns The text, transformed into a repetition of the replacement character, but with
 * simple whitespaces being preserved.
 */
export const replaceChars = (inputString: string, replacementCharacter: string): string => {
  const replaceChar = replacementCharacter[0];
  let outString = '';
  for (const char of inputString) {
    if (char.match(/[^a-zA-Z0-9]/g)) {
      outString += char;
    } else {
      outString += replaceChar;
    }
  }
  return outString;
};
