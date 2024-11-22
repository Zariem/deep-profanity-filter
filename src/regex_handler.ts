export type WordRegexComponents = {
  start: string;
  word: string;
  end: string;
};

// strings used to build regular expressions
const oneOrMoreNonWordCharacters = '[\\W_]+';
const aSingleWordCharacter = '[^\\W_]';
const nonWordCharactersExceptApostrophe = "[^a-zA-Z0-9'‘’]+";
const wordBoundary = '\\b';

// regular expressions to clean up strings used to build regular expressions
const nonWordCharsAtEndsOfString = /^\[\\W\_\]\+|\[\\W\_\]\+$/g; // identify the "non-word-characters" at the start or end of a string
const nonWordCharactersWithSpaceBetween = /\[\\W\_\]\+\s+\[\\W\_\]\+/g; // identify when two "non-word-characters" surround somes whitespace
const nonWordCharsAfterEscapeSlash = /\\\[\\W\_\]\+{1}/g; // identify the "non-word-characters interjected between escaped characters"

/**
 * For a character that is either a wildcard `*`, a letter `[a-zA-Z]` or anything else,
 * return a regular expression that matches either anything (for a wildcard), any word
 * boundary (for a letter), or any whitespace or start/end of string for all remaining cases.
 *
 * @param inputCharacter A string with a single character.
 * @param atStart Whether the character given was at the start or end of the string.
 * @returns a string used to build a regular expression
 */
const getRegExpComponentCharacter = (inputCharacter: string, atStart: boolean) => {
  if (inputCharacter === '*') {
    // match anything after wildcard characters
    return '';
  }
  if (inputCharacter.match(/[\W_]/g)) {
    // non-word character at start of search term: positive lookbehind for any whitespace or start of string
    // non-word character at end of search term: positive lookahead for any whitespace or end of string
    return atStart ? '(?<=^|\\s)' : '(?=\\s|$)';
  }
  // match a word boundery after word characters
  return wordBoundary;
};

/**
 * Escape a string so that we can build a `new RegExp(...)` with it and preserve
 * any special characters within the string, such as `. * + ? ^ $ { } ( ) [ ] \\ /`
 * and still match them properly. If you wish to match a singular backslash `\`
 * literally, make sure that in your badwordlist or whitelist, as well as in your
 * string that you are testing against, the backslash is escaped by replacing it
 * with `\\`.
 * @param inputString - The string you wish to escape for creating a regular expression.
 * @returns The escaped string that can be used in `new RegExp(...)`
 */
export const escapeStringForRegex = (inputString: string) => {
  return inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Splits up a word that has optional wildcards '*' at its start or end.
 * Removes the wildcards, and returns an empty string for start and end
 * if there was a wildcard, or a word-boundary string if there was none.
 * These components are then used to build regular expressions with.
 *
 * @param {string} badword - The bad word to split into its components.
 * @returns An object with the components accessible as obj.start, obj.word and obj.end
 */
export const getRegExpComponents = (badword: string): WordRegexComponents => {
  if (badword === '') {
    return { start: '', word: '', end: '' };
  }
  const sliceStart = badword.startsWith('*') ? 1 : 0; // if there's a * at the start, remove it
  const sliceEnd = badword.endsWith('*') ? -1 : undefined; // if there's a * at the end, remove it
  return {
    start: getRegExpComponentCharacter(badword[0], true),
    word: escapeStringForRegex(badword.slice(sliceStart, sliceEnd)),
    end: getRegExpComponentCharacter(badword[badword.length - 1], false),
  };
};

/**
 * Turn a bad word into a regular expression that checks if it is present
 * in the string with word boundaries \b on each side that does not have a wildcard.
 *
 * The word "kitty" would result in the regular expression:
 * /\bkitty\b/g
 * the word "hell*" would result in the regular expression:
 * /\bhell/g
 * If the word is a phrase with whitespace, replace that whitespace with a regular
 * expression that represents one or more non word characters.
 * The phrase "ban ananas" turns into:
 * /\bban[\W_]+ananas\b/g
 *
 * @param {WordRegexComponents} badWordComponents - The bad word, split into components by getRegExpComponents(...)
 * @returns The regular expression that can be used to find this word in a string.
 */
export const getNormalRegExp = (badwordComponents: WordRegexComponents): RegExp => {
  return new RegExp(
    badwordComponents.start + badwordComponents.word.replaceAll(/\s+/g, oneOrMoreNonWordCharacters) + badwordComponents.end,
    'g',
  );
};

// TODO: can we not just replace all whitespace with nothing first, then all nothing with non-word characters, then remove at start and end of string?
/**
 * Turn a bad word into a regular expression that checks for non-word characters
 * interjected between all of the characters, but containing a word boundary
 * on each side that does not have a wildcard.
 *
 * The word "kitty" would result in: /\bk[\W_]+i[\W_]+t[\W_]+t[\W_]+y\b/g
 *
 * It checks for variations such as:
 * "k i t t y", "k-i-t-t-y", "k.i,t;t~y" (with a word boundary at each side)
 *
 * The word "hell*" would result in: /\bh[\W_]+e[\W_]+l[\W_]+l/g
 *
 * Phrases with whitespace
 * If the word is a phrase with whitespace, turn the whitespace into the same
 * regular expression that allows any non-word character, but make sure there is only
 * one of these non-word-character-regexpressions at a space, as they allow 1 or more
 * characters already (specified with the + at the end)
 * So, "ban ananas" turns into:
 * /\bb[\W_]+a[\W_]+n[\W_]+a[\W_]+n[\W_]+a[\W_]+n[\W_]+a[\W_]+s\b/g
 *
 * @param {WordRegexComponents} badWordComponents - The bad word, split into components by getRegExpComponents(...)
 * @returns The regular expression that can be used to find this word in a string.
 */
export const getCircumventionRegExp = (badwordComponents: WordRegexComponents) => {
  return new RegExp(
    badwordComponents.start +
      badwordComponents.word
        .split('')
        .join(oneOrMoreNonWordCharacters)
        .replace(nonWordCharsAtEndsOfString, '')
        .replace(nonWordCharsAfterEscapeSlash, '\\')
        .replace(nonWordCharactersWithSpaceBetween, oneOrMoreNonWordCharacters) +
      badwordComponents.end,
    'g',
  );
};

/**
 * Create a regular expression used for whitelisting, that treats singularly spaced out characters
 * in front or after a bad word as "breaking the pattern" of the circumvention regular expression,
 * so that words such as:
 * "h e l l"
 * can still get blocked, but words such as
 * "s h e l l"
 * will make sure that the input doesn't trigger on the phrase "hell".
 *
 * For an explanation on matchApostrophes, check the description of `preprocessWordLists(...)`,
 * which covers the case of apostrophes matched vs. not matched at both the start and end of the word.
 *
 * @param {WordRegexComponents} badWordComponents - The bad word, split into components by getRegExpComponents(...)
 * @param {boolean} atWordStart - Whether this regex whitelists the word with an additional letter at the start
 * or whether it covers the case of an additional letter at the end.
 * @param {boolean} matchApostrophes - Whether the regular expression treats apostrophes before and after the word differently.
 * @returns The regular expression that can be used to find this word in a string, or undefined if the regular expression
 * is irrelevant and should not be used.
 */
export const getCircumventionWhitelistRegExp = (
  badwordComponents: WordRegexComponents,
  atWordStart: boolean,
  matchApostrophes: boolean,
) => {
  const newWordComponents = {
    start: badwordComponents.start,
    end: badwordComponents.end,
    word: badwordComponents.word,
  };
  if (atWordStart) {
    if (badwordComponents.start) {
      // match a word boundary, followed by a singular character, then an amount of empty characters
      newWordComponents.start = matchApostrophes ? '(?<!' + aSingleWordCharacter + "['‘’])" : '';
      newWordComponents.start += wordBoundary + aSingleWordCharacter + oneOrMoreNonWordCharacters;
    } else {
      return undefined;
    }
  } else {
    if (badwordComponents.end) {
      // match an amount of empty characters, followed by a singular character, then a word boundary
      newWordComponents.end = matchApostrophes ? nonWordCharactersExceptApostrophe : oneOrMoreNonWordCharacters;
      newWordComponents.end += aSingleWordCharacter + wordBoundary;
    } else {
      return undefined;
    }
  }
  return getCircumventionRegExp(newWordComponents);
};
