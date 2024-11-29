import {
  getCircumventionRegExp,
  getCircumventionWhitelistRegExp,
  getNormalRegExp,
  getRegExpComponents,
} from './regex_handler';
import { getWhitelistType } from './word_filter';

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
 * Which type the whitelisted word is, whether it whitelists the word itself (`Normal`), if the
 * whitelisted term without any special characters matches the word (`Reduced`), if the whitelisted
 * term matches the bad word's circumvention regular expression (`Circumvention`) or if it matches
 * both as Reduced and Circumvention (`ReducedAndCircumvention`).
 * Type `None` is for whitelisted words that don't whitelist this bad word in any way.
 */
export enum WhitelistWordType {
  None = 0,
  Normal,
  Reduced,
  Circumvention,
  ReducedAndCircumvention,
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
  type: WhitelistWordType;
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
  filterOptions: WordFilterOptions;
};

/**
 * The word lists and data used to modify already pre-calculated word lists by adding or removing
 * whitelisted terms or by removing/disabling bad words from that list.
 * This data can then be piggybacked onto an existing list in functions that find or get bad words.
 *
 * Using override data is recommended if lots of different parts of code share a very similar word list,
 * with different parts of the code having slight modifications to it, where modifications are expected to
 * contain significantly less words than the modified, "default" list.
 *
 * Can be created with `preprocessWordListOverrideData(...)`
 */
export type WordListOverrideData = {
  badWordDisables: string[];
  whitelistDisables: { [badword: string]: string[] };
  whitelistEnables: WhitelistMap;
};

/**
 * Creates the regular expressions used for testing for the presence of a bad word in a string.
 * @param badword - The bad word to create regular expressions for.
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
 * @returns an object containing the bad word and the regular expressions associated with it.
 */
export const getBadWordData = (
  badword: string,
  {
    checkCircumventions = true,
    considerPrecedingApostrophes = true,
    considerFollowUpApostrophes = true,
  }: WordFilterOptions = {},
): BadWordData => {
  const badWordComponents = getRegExpComponents(badword);
  const badwordRegexp = getNormalRegExp(badWordComponents);
  const circumventionRegexp = checkCircumventions ? getCircumventionRegExp(badWordComponents) : undefined;

  return {
    word: badword,
    normalRegexp: badwordRegexp,
    strictRegexp: circumventionRegexp,
    whitelistedStrictRegexpArray: checkCircumventions
      ? [
          getCircumventionWhitelistRegExp(badWordComponents, true, considerPrecedingApostrophes),
          getCircumventionWhitelistRegExp(badWordComponents, false, considerFollowUpApostrophes),
        ].filter((item) => item !== undefined)
      : [],
  };
}

/**
 * Tests if a word is a valid whitelist for a given bad word.
 * @param goodword - The word to check whether it whitelists the bad word.
 * @param badword - The bad word to check.
 * @param checkCircumventions - (Default: `true`)
 * **Highly recommended to use the same word filter options as for the word list you're building!**
 * Whether the whitelisted word is allowed to be a circumvention of the
 * bad word. If false, only direct matches count.
 * @param considerPrecedingApostrophes - (Default: `true`)
 * **Highly recommended to use the same word filter options as for the word list you're building!**
 * Whether your bad word's circumventions consider phrases such as "i'd b a d w o r d" or
 * "it's b a d w o r d" or "n'o't'a'b'a'd'w'o'r'd" as bad (it does if this param is `true`).
 * This determines whether such a term counts as a valid whitelist or not.
 * @param considerFollowUpApostrophes - (Default: `true`)
 * **Highly recommended to use the same word filter options as for the word list you're building!**
 * Whether your bad word's circumventions consider phrases such as "b a d w o r d's" or
 * "b a d w o r d'i n g" or "b'a'd'w'o'r'd'i'n'g" as bad (it does if this param is `true`).
 * This determines whether such a term counts as a valid whitelist or not.
 * @returns True if goodword whitelists badword. False if it does not.
 *
 * _(Returns `true` if badword is empty string `''`)_
 */
export const isValidWhitelist = (
  goodword: string,
  badword: string, 
  {
    checkCircumventions = true,
    considerPrecedingApostrophes = true,
    considerFollowUpApostrophes = true,
  }: WordFilterOptions = {},
): boolean => {
  const badWordData = getBadWordData(badword, { checkCircumventions, considerPrecedingApostrophes, considerFollowUpApostrophes });
  return getWhitelistType(goodword, badWordData) !== WhitelistWordType.None;
};

/**
 * Check if the given whitelist word data has a specified type.
 * For word data types `WhitelistWordType.Reduced` or `WhitelistWordType.Circumvention`
 * additionally check if the type we're checking against is `WhitelistWordType.ReducedAndCircumvention`
 * since some terms can fall into both categories.
 * @param wordData - The whitelist word data to check for a type
 * @param wordType - The type to check for
 * @returns - true if the whitelist data has this type
 */
export const hasWhitelistWordType = (wordData: WhitelistWordData, wordType: WhitelistWordType): boolean => {
  if (wordData.type === wordType) {
    return true;
  }
  if (wordData.type === WhitelistWordType.ReducedAndCircumvention) {
    return wordType === WhitelistWordType.Reduced || wordType === WhitelistWordType.Circumvention;
  }
  if (wordData.type === WhitelistWordType.Reduced || wordData.type === WhitelistWordType.Circumvention) {
    return wordType === WhitelistWordType.ReducedAndCircumvention;
  }
  return false;
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
 * @returns preprocessed bad words and whitelist words, with the whitelist entries mapped
 * to the bad words that they overlap/cover
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
  const filterOptions: WordFilterOptions = {
    checkCircumventions,
    considerPrecedingApostrophes,
    considerFollowUpApostrophes,
  }
  for (const badword of badwords) {
    if (badword === '') {
      continue;
    }
    const currentBadWordData = getBadWordData(badword, filterOptions);
    badWordData.push(currentBadWordData);

    for (const goodword of whitelist) {
      if (goodword === '') {
        continue;
      }

      const whitelistType = getWhitelistType(goodword, currentBadWordData);

      if (whitelistType !== WhitelistWordType.None) {
        const goodwordComponents = getRegExpComponents(goodword);
        const data = {
          word: goodword,
          normalRegexp: getNormalRegExp(goodwordComponents),
          strictRegexp: getCircumventionRegExp(goodwordComponents),
          type: whitelistType,
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
    filterOptions,
  };
};

/**
 * Prepares data that is piggybacked onto an existing, processed word list to modify it.
 * This override data can then be used to disable bad words in an existing list, as well
 * as disable existing whitelisted terms or add further whitelisted content.
 *
 * This feature can be used if one modifiable "default" word list is shared between many
 * applications, while each application can modify it, especially when modifications are
 * expected to contain significantly less words than the original "default" list.
 *
 * @param defaultWordList - the preprocessed word list that the next parameters will use
 * as a base for their preprocessing. Created with `preprocessWordLists(...)`
 * @param disabledDefaultWords - an array of strings of all bad words in the defaultWordList
 * that should be ignored when testing strings against this list
 * @param disabledDefaultWhitelist - an array of strings of all whitelisted terms in the
 * defaultWordList that should not be whitelisted and instead still count as bad words
 * @param additionalWhitelistWords - an array of strings of additional whitelist terms that
 * should be considered "okay" even if there is a bad word in them
 * @returns preprocessed override data that can be used in the algorithms that find, locate
 * or replace bad words in an input string
 */
export const preprocessWordListOverrideData = (
  defaultWordList: ProcessedWordLists,
  disabledDefaultWords: string[],
  disabledDefaultWhitelist: string[],
  additionalWhitelistWords: string[],
): WordListOverrideData => {
  // make sure we only add words that really disable entries
  const badWordDisables = [];
  for (const disabledBadWord of disabledDefaultWords) {
    if (defaultWordList.badWordData.findIndex((entry) => entry.word === disabledBadWord) >= 0) {
      badWordDisables.push(disabledBadWord);
    }
  }

  const whitelistDisables: { [badword: string]: string[] } = {};
  const whitelistEnables: WhitelistMap = {};
  for (const defaultBadWordData of defaultWordList.badWordData) {
    const badword = defaultBadWordData.word;

    // make sure to mark any disabled whitelist entries as such,
    // to link them to the bad word(s) that they cover and to double check that they exist in that whitelist
    for (const disabledGoodword of disabledDefaultWhitelist) {
      if (disabledGoodword === '') {
        continue;
      }
      if (
        defaultWordList.whitelistMap[badword] && // only disable words that are present in the whitelist map
        defaultWordList.whitelistMap[badword].findIndex((entry) => entry.word === disabledGoodword) >= 0
      ) {
        if (whitelistDisables[badword]) {
          whitelistDisables[badword].push(disabledGoodword);
        } else {
          whitelistDisables[badword] = [disabledGoodword];
        }
      }
    }

    // make sure to add any new whitelisted elements and preprocess them accordingly
    for (const goodword of additionalWhitelistWords) {
      if (goodword === '') {
        continue;
      }
      const badwordData = getBadWordData(badword, defaultWordList.filterOptions);
      const whitelistType = getWhitelistType(goodword, badwordData);
      if (
        whitelistType !== WhitelistWordType.None && // make sure the word matches the bad word
        (!defaultWordList.whitelistMap[badword] || // make sure the whitelisted word is not already there
          defaultWordList.whitelistMap[badword].findIndex((entry) => entry.word === goodword) < 0)
      ) {
        const goodwordComponents = getRegExpComponents(goodword);
        const data = {
          word: goodword,
          normalRegexp: getNormalRegExp(goodwordComponents),
          strictRegexp: getCircumventionRegExp(goodwordComponents),
          type: whitelistType,
        };
        if (whitelistEnables[badword]) {
          whitelistEnables[badword].push(data);
        } else {
          whitelistEnables[badword] = [data];
        }
      }
    }
  }

  return {
    badWordDisables,
    whitelistDisables,
    whitelistEnables,
  };
};
