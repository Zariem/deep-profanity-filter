import { textToLatin } from './input_preprocessor';
import { reconstructLocations, reduceInputString } from './reduce_input_string';
import { grawlix, replaceChars } from './replace_input';
import { BadWordData, WhitelistMap, ProcessedWordLists, WordListOverrideData } from './wordlist_preprocessor';

export enum InputPreprocessMethod {
  Thorough, // textToLatin (removing accents, translating foreign characters and emojis to latin letters)
  CaseInsensitive, // converting input to lower case before searching for bad words
  ExactMatch, // no preprocessing (not recommended)
}

export enum WordReplacementMethod {
  ReplaceAll,
  KeepFirstCharacter,
  KeepFirstAndLastCharacter,
}

export enum WordReplacementType {
  RepeatCharacter,
  Grawlix,
}

/**
 * Options used in `findBadWordLocations(...)` to determine how to search for bad words.
 * @param firstMatchOnly - (Default: `false`) If true, returns only the first match.
 * If false, returns all matched bad words.
 * @param overrideData - (Default: `undefined`) Data used to modify a list by removing words or whitelisted
 * terms or by adding new whitelisted terms. Created with `preprocessWordListOverrideData`
 */
export interface WordSearchOptions {
  firstMatchOnly?: boolean;
  overrideData?: WordListOverrideData;
}

/**
 * Options used in `replaceBadWords(...)` to determine how to replace bad words in a given input string.
 * @param replacementMethod - (Default: `WordReplacementMethod.ReplaceAll`) Used to select whether to replace the
 * whole word, or keep the first (and last) characters from the bad word intact.
 * @param replacementType - (Default: `WordReplacementType.Grawlix`) Used to select whether to replace the
 * word with a jumbled mess of Grawlix (`$!#@&%`)  characters, or with a selected repeatable character defined
 * in the next parameter.
 * @param replacementRepeatCharacter - (Default: `-`) The character to repeat in order to replace the bad word.
 * (If several characters are entered, only the first one will be used.)
 */
export interface WordReplacementOptions {
  replacementMethod?: WordReplacementMethod;
  replacementType?: WordReplacementType;
  replacementRepeatCharacter?: string;
}

/**
 * Options used in `censorText(...)` to determine how to filter and replace bad words in a given input string.
 * @param inputPreprocessMethod - (Default: `InputPreprocessMethod.CaseInsensitive`) Used to preprocess the input
 * string before identifying bad words. `CaseInsensitive`: transforms the input to lower case and then matches it against
 * the bad word list. `Thorough` uses the `textToLatin()` function to remove text accents, translate letter emojis and
 * any other fancy unicode fonts to latin before testing for bad words.
 * `ExactMatch` matches the input string against the bad word list exactly.
 * @param replacementMethod - (Default: `WordReplacementMethod.ReplaceAll`) Used to select whether to replace the
 * whole word, or keep the first (and last) characters from the bad word intact.
 * @param replacementType - (Default: `WordReplacementType.Grawlix`) Used to select whether to replace the
 * word with a jumbled mess of Grawlix (`$!#@&%`)  characters, or with a selected repeatable character defined
 * in the next parameter.
 * @param replacementRepeatCharacter - (Default: `-`) The character to repeat in order to replace the bad word.
 * (If several characters are entered, only the first one will be used.)
 */
export interface WordCensorOptions {
  inputPreprocessMethod?: InputPreprocessMethod;
  replacementMethod?: WordReplacementMethod;
  replacementType?: WordReplacementType;
  replacementRepeatCharacter?: string;
}

/**
 * Information on a bad word that has been found, containing the index at which it starts
 * in the input string, as well as its length. Also contains a flag that indicated whether
 * a whitelisted word "nullifies" this bad word, so that we know to not test this word
 * for further whitelistings.
 */
type BadWordMatchInfo = {
  word: string;
  isWhitelisted: boolean;
  startIndex: number;
  length: number;
};

/**
 * Information on a bad word that has been found, containing the index at which it starts
 * in the input string, as well as its length.
 */
export type BadWordMatchData = {
  word: string;
  startIndex: number;
  length: number;
};

/**
 * Turns an object of type `BadWordMatchInfo` into the type `BadWordMatchData`
 */
const toBadWordMatchData = (badWordMatchInfo: BadWordMatchInfo) => {
  const { isWhitelisted, ...matchData } = badWordMatchInfo;
  return matchData;
};

/**
 * Checks if the bad word is fully contained within the whitelisted word,
 * given their start indices and lengths.
 * @param badWordStartIndex - The index at which the bad word starts in the input string.
 * @param badWordLength - The length of the bad word in the input string.
 * @param goodWordStartIndex - The index at which the whitelisted word starts in the input string.
 * @param goodWordLength - The length of the whitelisted word in the input string.
 * @returns True, if the bad word is fully contained in this whitelisted term. False, otherwise.
 */
const isMatchWhitelisted = (badWordStartIndex, badWordLength, goodWordStartIndex, goodWordLength): boolean => {
  return (
    badWordStartIndex >= goodWordStartIndex && badWordStartIndex + badWordLength <= goodWordStartIndex + goodWordLength
  );
};

/**
 * Finds the location(s) of a given bad word's appearances in an input string.
 * Includes checks of the whitelist, in order to ensure that whitelisted occurrences
 * of bad words are not considered "bad".
 * Can check either strictly, considering circumvention attempts, or non-strictly,
 * considering only whether the bad word (or phrase) itself appears in the input string.
 * @param inputString - The text to check for bad words.
 * @param badwordData - The data for one bad word - from of the array of bad word data generated by `preprocessWordLists`
 * @param whitelistMap - The map of whitelisted words, generated by `preprocessWordLists`
 * @param checkStrict - Whether to check for circumventions or not.
 * @param overrideData - (Default: `undefined`) Data used to modify a list by removing words or whitelisted
 * terms or by adding new whitelisted terms. Created with `preprocessWordListOverrideData`
 * @returns An array of BadWordMatchData that contains the word and the start indices and
 * lengths of any substrings matching the word.
 */
const findBadWordMatchData = (
  inputString: string,
  badwordData: BadWordData,
  whitelistMap: WhitelistMap,
  checkStrict: boolean,
  overrideData?: WordListOverrideData,
): BadWordMatchData[] => {
  const badwordRegExp = checkStrict ? badwordData.strictRegexp : badwordData.normalRegexp;
  const matches = inputString.matchAll(badwordRegExp);

  // make a checklist of which matches we found, remove them once we see they are whitelisted
  let badWordMatchInfo: BadWordMatchInfo[] = [];
  for (const match of matches) {
    badWordMatchInfo.push({
      word: badwordData.word,
      isWhitelisted: false,
      startIndex: match.index,
      length: match[0].length,
    });
  }
  if (badWordMatchInfo.length === 0) {
    return []; // no bad word was found
  }

  let whitelistArray = whitelistMap[badwordData.word] || [];

  if (overrideData) {
    // remove all the whitelisted words that the override disables
    if (overrideData.whitelistDisables[badwordData.word]) {
      whitelistArray = whitelistArray.filter(
        (element) => !overrideData.whitelistDisables[badwordData.word].includes(element.word),
      );
    }
    // add all the whitelisted words that the override adds
    if (overrideData.whitelistEnables[badwordData.word]) {
      whitelistArray = whitelistArray.concat(overrideData.whitelistEnables[badwordData.word]);
    }
  }

  if (whitelistArray.length === 0) {
    // some bad words were found and we have no whitelisted terms for them
    return badWordMatchInfo;
  }

  // if we are checking for bad word circumventions also check the specific "strict" whitelist
  // that avoids blocking good content such as "s h e l l" for discovering bad content within, such as "h e l l"
  const whitelistRegexData = checkStrict
    ? whitelistArray.map((elem) => elem.strictRegexp).concat(badwordData.whitelistedStrictRegexpArray)
    : whitelistArray.map((elem) => elem.normalRegexp);

  // iterate through the whitelist that overlaps with this bad word,
  // based on start index and match length, we can determine if a bad word
  // is okay to be used (i.e. whether it is whitelisted).
  for (const whitelistRegex of whitelistRegexData) {
    const whitelistMatches = inputString.matchAll(whitelistRegex);
    if (whitelistMatches) {
      for (const whitelistMatch of whitelistMatches) {
        for (const badWordElement of badWordMatchInfo) {
          if (
            isMatchWhitelisted(
              badWordElement.startIndex,
              badWordElement.length,
              whitelistMatch.index,
              whitelistMatch[0].length,
            )
          ) {
            badWordElement.isWhitelisted = true; // remove later, to not break the loop
          }
        }
        badWordMatchInfo = badWordMatchInfo.filter((element) => !element.isWhitelisted);
        if (badWordMatchInfo.length === 0) {
          return []; //  early out - all bad words were whitelisted
        }
      }
    }
  }

  return badWordMatchInfo.map((match) => toBadWordMatchData(match)) as BadWordMatchData[];
};

/**
 * Given your preprocessed bad word list and whitelist, checks if a given text contains any bad word
 * that hasn't been allowed by the whitelist. Checks for the most common circumventions as well.
 *
 * IMPORTANT: Make sure that any backslash in the inputString is escaped correctly.
 * If you are trying to see whether the string `¯\_(ツ)_/¯` is a bad word, you have to
 * enter it as `¯\\_(ツ)_/¯` to match it correctly.
 *
 * @param inputString - The text you wish to check for bad words.
 * @param processedWordLists - The preprocessed bad word list and whitelist, generated by `preprocessWordLists(...)`
 * @param overrideData - (Default: `undefined`) Data used to modify a list by removing words or whitelisted
 * terms or by adding new whitelisted terms. Created with `preprocessWordListOverrideData`
 * @returns True if any bad word was found, false if no bad word was found or all bad words were whitelisted.
 */
export const doesContainBadWords = (
  inputString: string,
  processedWordLists: ProcessedWordLists,
  overrideData?: WordListOverrideData,
) => {
  if (findAnyBadWord(inputString, processedWordLists, overrideData)) {
    return true;
  }
  return false;
};

/**
 * Finds all bad words contained in a string, as well as their locations, indicated by start index and length.
 *
 * IMPORTANT: Make sure that any backslash in the inputString is escaped correctly.
 * If you are trying to see whether the string `¯\_(ツ)_/¯` is a bad word, you have to
 * enter it as `¯\\_(ツ)_/¯` to match it correctly.
 *
 * @param inputString  - The text you wish to check for bad words.
 * @param processedWordLists - The preprocessed bad word list and whitelist, generated by `preprocessWordLists(...)`
 * @param firstMatchOnly - (Default: `false`) If true, returns only the first match. If false, returns all matched
 * bad words.
 * @param overrideData - (Default: `undefined`) Data used to modify a list by removing words or whitelisted
 * terms or by adding new whitelisted terms. Created with `preprocessWordListOverrideData`
 * --------
 * @returns an array of information about all found bad words and where they are located in the input string.
 */
export const findBadWordLocations = (
  inputString: string,
  processedWordLists: ProcessedWordLists,
  { firstMatchOnly = false, overrideData }: WordSearchOptions = {},
): BadWordMatchData[] => {
  let allBadWordLocations: BadWordMatchData[] = [];
  for (const badwordData of processedWordLists.badWordData) {
    // check if we ignore the word, in that case we can skip it
    if (overrideData && overrideData.badWordDisables.includes(badwordData.word)) {
      continue;
    }

    // if we check for an exact match
    // try to match the word with its special characters, as they could
    // form word boundaries, such as in "test-kitty-word".
    let locations = findBadWordMatchData(
      inputString,
      badwordData,
      processedWordLists.whitelistMap,
      false,
      overrideData,
    );

    // if we are only looking for one word, return it at this point
    if (firstMatchOnly && locations.length > 0) {
      return [locations[0]];
    }

    // if we are checking circumventions at all
    if (badwordData.strictRegexp !== undefined) {
      // try removing all special characters from the input string
      // and match it against the word itself, with word boundaries.
      const reducedData = reduceInputString(inputString);
      if (reducedData.reducedInput !== inputString) {
        const matchedReducedStringLocations = findBadWordMatchData(
          reducedData.reducedInput,
          badwordData,
          processedWordLists.whitelistMap,
          false,
          overrideData,
        );
        let actualReducedStringLocations: BadWordMatchData[] = [];
        if (matchedReducedStringLocations.length > 0) {
          actualReducedStringLocations = reconstructLocations(
            reducedData.reducedLocations,
            matchedReducedStringLocations,
          );
          if (firstMatchOnly) {
            return [actualReducedStringLocations[0]];
          }
        }
        locations = locations.concat(actualReducedStringLocations);
      }

      // finally try to match the word with common circumventions, such as
      // "bad k i t t y" while ensuring words such as "k i t t y c a t" are considered bad.
      const circumventions = findBadWordMatchData(
        inputString,
        badwordData,
        processedWordLists.whitelistMap,
        true,
        overrideData,
      );
      if (firstMatchOnly && circumventions.length > 0) {
        return [circumventions[0]];
      }
      locations = locations.concat(circumventions);
    }

    // collect all the matches for this bad word
    allBadWordLocations = allBadWordLocations.concat(locations);
  }

  return allBadWordLocations;
};

/**
 * Given your preprocessed bad word list and whitelist, checks if a given text contains any bad word
 * that hasn't been allowed by the whitelist. Checks for the most common circumventions as well.
 * If any bad word was found, the first word that was found will be returned.
 *
 * IMPORTANT: Make sure that any backslash in the inputString is escaped correctly.
 * If you are trying to see whether the string `¯\_(ツ)_/¯` is a bad word, you have to
 * enter it as `¯\\_(ツ)_/¯` to match it correctly.
 *
 * @param inputString  - The text you wish to check for bad words.
 * @param processedWordLists - The preprocessed bad word list and whitelist, generated by `preprocessWordLists(...)`
 * @param overrideData - (Default: `undefined`) Data used to modify a list by removing words or whitelisted
 * terms or by adding new whitelisted terms. Created with `preprocessWordListOverrideData`
 * @returns The first bad word that was found in the input, or undefined if no bad word was found.
 */
export const findAnyBadWord = (
  inputString: string,
  processedWordLists: ProcessedWordLists,
  overrideData?: WordListOverrideData,
): string | undefined => {
  const result = findBadWordLocations(inputString, processedWordLists, {
    firstMatchOnly: true,
    overrideData,
  });
  if (result.length > 0) {
    return result[0].word;
  }
  return undefined;
};

/**
 * Given the bad word locations found by `findBadWordLocations(...)`,
 * extract all the bad words from that data.
 * This function is useful if you need both the bad words as well as the input string
 * with all bad words replaced (check out `replaceBadWords(...)` for the latter.)
 *
 * If the bad words are all you need, consider using `findAllBadWords(...)` instead.
 * If you only need one bad word, consider using `findAnyBadWord(...)`, and if you
 * only need to know whether there is a bad word, consider using `doesContainBadWord(...)`.
 *
 * @param badWordLocations - The locations of bad words in your input string checked
 * with `findBadWordLocations(...)`
 * @returns An array of strings of all bad words found in the text. Only contains each
 * bad word once, even if they repeat.
 */
export const getBadWords = (badWordLocations: BadWordMatchData[]): string[] => {
  const foundWords: string[] = [];
  for (const matchInfo of badWordLocations) {
    if (!foundWords.includes(matchInfo.word)) {
      foundWords.push(matchInfo.word);
    }
  }
  return foundWords;
};

/**
 * Given your preprocessed bad word list and whitelist, checks for all bad words in a given input text
 * that haven't been allowed by the whitelist. Checks for the most common circumventions as well.
 * Returns an array of strings of all bad words.
 *
 * IMPORTANT: Make sure that any backslash in the inputString is escaped correctly.
 * If you are trying to see whether the string `¯\_(ツ)_/¯` is a bad word, you have to
 * enter it as `¯\\_(ツ)_/¯` to match it correctly.
 *
 * @param inputString - The text you wish to check for bad words.
 * @param processedWordLists - The preprocessed bad word list and whitelist, generated by `preprocessWordLists(...)`
 * @param overrideData - (Default: `undefined`) Data used to modify a list by removing words or whitelisted
 * terms or by adding new whitelisted terms. Created with `preprocessWordListOverrideData`
 * @returns The first bad word that was found in the input, or undefined if no bad word was found.
 */
export const findAllBadWords = (
  inputString: string,
  processedWordLists: ProcessedWordLists,
  overrideData?: WordListOverrideData,
): string[] => {
  const badWordLocations = findBadWordLocations(inputString, processedWordLists, { overrideData });
  return getBadWords(badWordLocations);
};

/**
 * Sanitise any text by replacing bad words in it with Grawlix (`$!#@&%`) or a single repeated character.
 * This function is useful if you need both the bad words as well as the input string
 * with all bad words replaced (check out `getBadWords(...)` for the latter.)
 *
 * If you only need a "censored" input string but are not interested in identifying which bad words were
 * censored, consider using `censorText(...)` instead.
 *
 * @param inputString - The text that got checked for bad words in `findBadWordLocations(...)`
 * @param badWordLocations - The information on all bad word matches found with `findBadWordLocations(...)`
 * @param replacementMethod - (Default: `WordReplacementMethod.ReplaceAll`) Used to select whether to replace the
 * whole word, or keep the first (and last) characters from the bad word intact.
 * @param replacementType - (Default: `WordReplacementType.Grawlix`) Used to select whether to replace the
 * word with a jumbled mess of Grawlix (`$!#@&%`)  characters, or with a selected repeatable character defined
 * in the next parameter.
 * @param replacementRepeatCharacter - (Default: `-`) The character to repeat in order to replace the bad word.
 * (If several characters are entered, only the first one will be used.)
 * @returns the input string, with all bad words replaced by either Grawlix or a repeated character.
 */
export const replaceBadWords = (
  inputString: string,
  badWordLocations: BadWordMatchData[],
  {
    replacementMethod = WordReplacementMethod.ReplaceAll,
    replacementType = WordReplacementType.Grawlix,
    replacementRepeatCharacter = '-',
  }: WordReplacementOptions = {},
): string => {
  let outString = inputString;

  for (const badWordLocation of badWordLocations) {
    const startIndex = badWordLocation.startIndex + (replacementMethod === WordReplacementMethod.ReplaceAll ? 0 : 1);
    let lengthModifier = 0;
    if (replacementMethod === WordReplacementMethod.KeepFirstAndLastCharacter) {
      lengthModifier = 2;
    } else if (replacementMethod === WordReplacementMethod.KeepFirstCharacter) {
      lengthModifier = 1;
    }
    const length = badWordLocation.length - lengthModifier;

    const wordToReplace = outString.substring(startIndex, startIndex + length);
    const newBadWord =
      replacementType === WordReplacementType.Grawlix
        ? grawlix(wordToReplace)
        : replaceChars(wordToReplace, replacementRepeatCharacter);
    outString = outString.substring(0, startIndex) + newBadWord + outString.substring(startIndex + length);
  }

  return outString;
};

/**
 * Sanitise any text by replacing bad words in it with Grawlix (`$!#@&%`) or a single repeated character.
 *
 * @param inputString - The text that got checked for bad words in `findBadWordLocations(...)`
 * @param processedWordLists - The preprocessed bad word list and whitelist, generated by `preprocessWordLists(...)`
 * @param inputPreprocessMethod - (Default: `InputPreprocessMethod.CaseInsensitive`) Used to preprocess the input
 * string before identifying bad words. `CaseInsensitive`: transforms the input to lower case and then matches it against
 * the bad word list.
 * `Thorough` uses the `textToLatin()` function to remove text accents, translate letter emojis and
 * any other fancy unicode fonts to latin before testing for bad words. Note: If non-latin characters are found,
 * the censored text will be returned all in lower case and in latin letters.
 * `ExactMatch` matches the input string against the bad word list exactly.
 * @param replacementMethod - (Default: `WordReplacementMethod.ReplaceAll`) Used to select whether to replace the
 * whole word, or keep the first (and last) characters from the bad word intact.
 * @param replacementType - (Default: `WordReplacementType.Grawlix`) Used to select whether to replace the
 * word with a jumbled mess of Grawlix (`$!#@&%`)  characters, or with a selected repeatable character defined
 * in the next parameter.
 * @param replacementRepeatCharacter - (Default: `-`) The character to repeat in order to replace the bad word.
 * (If several characters are entered, only the first one will be used.)
 * @param overrideData - (Default: `undefined`) Data used to modify a list by removing words or whitelisted
 * terms or by adding new whitelisted terms. Created with `preprocessWordListOverrideData`
 * @returns the input string, with all bad words replaced by either Grawlix or a repeated character.
 */
export const censorText = (
  inputString: string,
  processedWordLists: ProcessedWordLists,
  {
    inputPreprocessMethod = InputPreprocessMethod.CaseInsensitive,
    replacementMethod = WordReplacementMethod.ReplaceAll,
    replacementType = WordReplacementType.Grawlix,
    replacementRepeatCharacter = '-',
  }: WordCensorOptions = {},
  overrideData?: WordListOverrideData,
): string => {
  let stringToScan = inputString;
  if (inputPreprocessMethod === InputPreprocessMethod.CaseInsensitive) {
    stringToScan = stringToScan.toLowerCase();
  } else if (inputPreprocessMethod === InputPreprocessMethod.Thorough) {
    stringToScan = textToLatin(inputString);
  }
  const locations = findBadWordLocations(stringToScan, processedWordLists, { overrideData });

  if (locations.length === 0) {
    return inputString;
  }

  let stringToReplace = stringToScan;
  if (stringToScan === inputString.toLowerCase()) {
    stringToReplace = inputString;
  }
  return replaceBadWords(stringToReplace, locations, {
    replacementMethod,
    replacementType,
    replacementRepeatCharacter,
  });
};
