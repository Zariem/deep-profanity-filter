import {
  getCircumventionRegExp,
  getCircumventionWhitelistRegExp,
  getNormalRegExp,
  getRegExpComponents,
} from './regex_handler';

/**
 * @param checkCircumventions - (Default: `true`)
 * if false, the bad word matched exactly. If true, the bad word is additionally
 * matched with any special characters in between, such as `ki%tt-y`, as well as
 * with all characters spaced out, such as `k i t t y`. It makes sense to set this
 * value to `false` when matching URLs/links or in-text-emojis such as `¯\_(ツ)_/¯`
 * @param considerPrecedingApostrophes - (Default: `true`)
 * if true, and in the case of spaced out words without a wildcard at the start,
 * it will NOT allow phrases such as "i'd b a d w o r d" or "it's b a d w o r d"
 * or "n'o't'a'b'a'd'w'o'r'd" (the latter may be considered okay by some.)
 * If considerPrecedingApostrophes = false, all of the above are allowed.
 * Consider setting this value based on the language you're targeting, but for
 * English it might be reasonable to set it to "true".
 * @param considerFollowUpApostrophes - (Default: `true`)
 * if true, and in the case of spaced out words without a wildcard at the end,
 * it will NOT allow phrases such as "b a d w o r d's" or "b a d w o r d'i n g" or
 * "b'a'd'w'o'r'd'i'n'g" (where "badword" is the blocked term)
 * If considerFollowUpApostrophes = false, all of the above are allowed.
 * (Note: In either case, formats such as "b a d w o r d'ing" and "b a d w o r d'ed" get blocked)
 * Consider setting this value based on the language you're targeting, but for
 * English it might be reasonable to set it to "true".
 * Note: The apostrophe circumventions are very rarely used, so this is an
 * edge case, especially because cases where the word is not s p a c e d out are
 * handled differently.
 */
export interface WordFilterOptions {
  checkCircumventions?: boolean;
  considerPrecedingApostrophes?: boolean;
  considerFollowUpApostrophes?: boolean;
}

/**
 * Contains the word, as well as the normal regular expression created by
 * `getNormalRegExp(...)` and the circumvention regular expression created by
 * `getCircumventionRegExp(...)`
 */
export type WhitelistWordData = {
  word: string;
  normalRegexp: RegExp;
  strictRegexp: RegExp;
};

/**
 * Contains the word, as well as the normal regular expression created by
 * `getNormalRegExp(...)`, the circumvention regular expression created by
 * `getCircumventionRegExp(...)` and the whitelisted regular expressions used
 * to avoid false positives when using the strict regular expression, which
 * are created by `getCircumventionWhitelistRegExp(...)`
 */
export type BadWordData = {
  word: string;
  normalRegexp: RegExp;
  strictRegexp: RegExp;
  whitelistedStrictRegexpArray: RegExp[];
};

/**
 * A map from a bad word or phrase to an array of data about
 * whitelisted words and phrases that contain the bad word.
 */
export type WhitelistMap = { [badword: string]: WhitelistWordData[] };

/**
 * The word lists and data used by the WordFilter algorithms.
 * Can be created from two simple array of strings with the
 * function `preprocessWordLists(...)`
 */
export type ProcessedWordLists = {
  badWordData: BadWordData[];
  whitelistMap: WhitelistMap;
};

/**
 * Creates the regular expressions facilitating the search of bad words,
 * as well as the lookup table of all whitelisted words (linked to only the
 * those bad words which are contained in this whitelisted word).
 * This is used in the filtering algorithms.
 *
 * IMPORTANT: If you wish to match a backslash `\` character in any bad word,
 * you will always need to escape it. Trying to detect someone entering
 * `¯\_(ツ)_/¯` would mean your bad word would need to be `¯\\_(ツ)_/¯`.
 * If you allow others to define bad word inputs, always sanitise strings
 * containing backslashes by replacing them with two backslashes.
 *
 * @param badwords - an array of bad words or phrases that are being
 * checked in the texts that we filter
 * @param whitelist - an array of whitelisted words or phrases that
 * contain one or more bad words but are purposefully not being checked
 * @param checkCircumventions - (Default: `true`)
 * if false, the bad word matched exactly. If true, the bad word is additionally
 * matched with any special characters in between, such as `ki%tt-y`, as well as
 * with all characters spaced out, such as `k i t t y`. It makes sense to set this
 * value to `false` when matching URLs/links or in-text-emojis such as `¯\_(ツ)_/¯`
 * @param considerPrecedingApostrophes - (Default: `true`)
 * if true, and in the case of spaced out words without a wildcard at the start,
 * it will NOT allow phrases such as "i'd b a d w o r d" or "it's b a d w o r d"
 * or "n'o't'a'b'a'd'w'o'r'd" (the latter may be considered okay by some.)
 * If considerPrecedingApostrophes = false, all of the above are allowed.
 * Consider setting this value based on the language you're targeting, but for
 * English it might be reasonable to set it to "true".
 * @param considerFollowUpApostrophes - (Default: `true`)
 * if true, and in the case of spaced out words without a wildcard at the end,
 * it will NOT allow phrases such as "b a d w o r d's" or "b a d w o r d'i n g" or
 * "b'a'd'w'o'r'd'i'n'g" (where "badword" is the blocked term)
 * If considerFollowUpApostrophes = false, all of the above are allowed.
 * (Note: In either case, formats such as "b a d w o r d'ing" and "b a d w o r d'ed" get blocked)
 * Consider setting this value based on the language you're targeting, but for
 * English it might be reasonable to set it to "true".
 * Note: The apostrophe circumventions are very rarely used, so this is an
 * edge case, especially because cases where the word is not s p a c e d out are
 * handled differently.
 * @returns a mapped whitelist allowing easy lookup for all bad words
 * to see all whitelisted words that contain this bad word
 */
export const preprocessWordLists = (
  badwords: string[],
  whitelist: string[],
  {
    checkCircumventions = true,
    considerPrecedingApostrophes = true,
    considerFollowUpApostrophes = true,
  }: WordFilterOptions = {},
): ProcessedWordLists => {
  const badWordData: BadWordData[] = [];
  const whitelistMap: WhitelistMap = {}; // map from badword -> [goodwords] (array of good word data)
  for (const badword of badwords) {
    if (badword === '') {
      continue;
    }
    const badWordComponents = getRegExpComponents(badword);
    const badwordRegexp = getNormalRegExp(badWordComponents);

    badWordData.push({
      word: badword,
      normalRegexp: badwordRegexp,
      strictRegexp: checkCircumventions ? getCircumventionRegExp(badWordComponents) : undefined,
      whitelistedStrictRegexpArray: checkCircumventions
        ? [
            getCircumventionWhitelistRegExp(badWordComponents, true, considerPrecedingApostrophes),
            getCircumventionWhitelistRegExp(badWordComponents, false, considerFollowUpApostrophes),
          ].filter((item) => item !== undefined)
        : [],
    });

    for (const goodword of whitelist) {
      if (goodword === '') {
        continue;
      }
      if (goodword.match(badwordRegexp)) {
        const goodwordComponents = getRegExpComponents(goodword);
        const data = {
          word: goodword,
          normalRegexp: getNormalRegExp(goodwordComponents),
          strictRegexp: getCircumventionRegExp(goodwordComponents),
        };
        if (whitelistMap[badword]) {
          whitelistMap[badword].push(data);
        } else {
          whitelistMap[badword] = [data];
        }
      }
    }
  }
  return {
    badWordData,
    whitelistMap,
  };
};
