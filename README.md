# deep-profanity-filter

A thorough profanity filter that considers most common circumventions.
Works with your custom list of blocked and whitelisted words and phrases.
Allows preprocessing input strings to latinise many fancy unicode alphabets.


[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/B0B0MH76V)
## Installation
`npm install deep-profanity-filter`

## Contents
This package can be divided into three parts:
1. **Setting Up a List of Words**
How to provide words or phrases, and what gets detected as a bad word given your list of words.
How to provide whitelisted terms to allow certain words or phrases as exceptions.
How to do changes to your list.
How to check if an allowed/whitelisted term is actually effective and covering a bad word.
2. **Detecting Words from the List**
How to use the tool to detect bad content, given your bad word list and whitelist.
3. **Input Preprocessing**
How to use the tool to translate letter emojis or fancy 𝓤𝓷𝓲𝓬𝓸𝓭𝓮 𝔸𝕝𝕡𝕙𝕒𝕓𝕖𝕥𝕤 to latin letters or reduce repeeeeaattt characters from your input.

In the following section there will first be an explanation on how to do these things in JavaScript or TypeScript code, followed by some in-depth examples of what words and circumventions may get detected as bad words with some given input words.

# Code Usage
## Main Functions
```js
import {
	// Input Preprocessing
	unEmoji, // removes text-alike emojis in a string and replaces them with latin characters
	removeTextAccents, // removes accents from characters in a string
	textToLatin, // puts text to lowercase, replaces unicode characters that look like
		// letters with latin letters, and removes text-like emojis and accents
	reduceRepeatCharacters, // reduces repeat characters to an amount specified
				// (e.g. with amount=2, "ttttteessst" => "tteesst")
	
	// WordList Preprocessing
	preprocessWordLists, // needed to set up bad word list and whitelist
	isValidWhitelist, // check if a specific word whitelists a given bad word
	
	// Wordlist Overrides - used to piggyback bad words and allowed terms
	// onto existing lists on the fly
	preprocessWordListOverrideData, // set up specific override data
	
	// Bad Word Detection
	doesContainBadWords, // boolean true/false check on an input string
	findAnyBadWord, // string of the first bad word found, undefined if none
	findAllBadWords, // string[] of all bad words found in the input string
	
	// Bad Word Replacement
	censorText, // replaces bad words in a text
	
	// Bad Word Replacement Settings
	InputPreprocessMethod, // used to preprocess the input in the censorText(...) function
	WordReplacementMethod, // used to replace all except first and/or last character of bad words
	WordReplacementType, // used to replace bad words with grawlix (`&@!#`) or a repeated character
	
	// Bad Word Replacement and Detection (if both needed)
	// (it is more efficient to call these if you need both functionalities)
	findBadWordLocations, // gets the locations (and words) of bad words found in the input
	getBadWords, // uses these locations to get all bad words in a string
	replaceBadWords, // uses these locations to replace bad words in a string
} from 'deep-profanity-filter';

// Alternatively, import and use the functions with:
const ProfanityFilter = require('deep-profanity-filter');
ProfanityFilter.preprocessWordLists(...)
```
---
### Setting Up a List of Words
```js
import { preprocessWordLists } from 'deep-profanity-filter';

let badwords = ['kitty', 'hell*', '*word*', 'ban ananas'] // example
let whitelist = ['hello kitty', 'hello*', 'ban ananas juice', 'keyword', 'loanword*', '*sword*', '*wording'] // example

// This wordFilter is what we use to then test any input string with
let wordFilter = preprocessWordLists(badwords, whitelist);
```
Alternately, you can also change some fine-tuned settings, such as:
- whether to check for circumventions (default: `true`) or only for exact matches of the word. In the case of checking for links or content such as `¯\_(ツ)_/¯`, it makes sense to only check the exact match.
- how to handle apostrophes in `s p a c e d` content. You can read up on the implications of these further down in this readme. For filtering English content, it is recommended to leave both values on their defaults. For other languages you may benefit from setting one or both value to false.
```js
let wordFilter = preprocessWordLists(badwords, whitelist, {
	checkCircumventions: false, // default = true
});
									 
let wordFilter2 = preprocessWordLists(badwords, whitelist, {
	considerPrecedingApostrophes: false, // default = true
	considerFollowUpApostrophes: false, // default = true
});

let wordFilter3 = preprocessWordLists(badwords, whitelist, {
	considerFollowUpApostrophes: false, // default = true
});
```
**Note**: While you can set all of these values at the same time, `considerPrecedingApostrophes` and `considerFollowUpApostrophes` only have an effect on circumvented variations of the word, so if you set `checkCircumventions` to `false`, setting the apostrophe handling is redundant.

**Note**: Since these settings apply to a whole list of words, it makes sense to treat content that needs to only be matched exactly - such as links - in its own word list and check any input against both word lists separately.

### Changing The Word Lists
```js
// When changing your word lists, always regenerate the filter
// using preprocessWordLists(...)
badwords.push("newbadword");
whitelist.push("newbadword but good");
wordFilter = preprocessWordLists(badwords, whitelist /*{ WordFilterOptions }*/);
```
#### Override Data
In some cases, you might need to apply different changes to the same word list, for example if you have a **default list** that multiple people can customise individually, yet you don't wish to store your default data multiple times. In that case, override lists might come of use. In pretty much any other case, they are not necessary.
```js
import { preprocessWordLists, preprocessWordListOverrideData } from 'deep-profanity-filter'
let badwords = ['kitty', 'hell*', '*word*', 'ban ananas'] // example
let whitelist = ['hello kitty', 'hello*', 'ban ananas juice', 'keyword', 'loanword*', '*sword*', '*wording'];
let wordFilter = preprocessWordLists(badwords, whitelist);

const disabledDefaultWords = ['ban ananas']; // "remove" this word from the badwords list
const disabledDefaultWhitelist = ['ban ananas juice', 'keyword']; // "remove" these from the whitelist
const additionalWhitelistWords = ['kitty cat'];
let overrideData = preprocessWordListOverrideData(
	wordFilter, // the word list to which you want to piggy-back information
	disabledDefaultWords,
	disabledDefaultWhitelist,
	additionalWhitelistWords,
);
```
```js
// Using this override list with any functions to detect bad words is equivalent to
// not using any override list and instead just creating a word list with those terms modified:
let badwords2 = ['kitty', 'hell*', '*word*']; // removed "ban ananas"
let whitelist2 = ['hello kitty', 'hello*', 'loanword*', '*sword*', '*wording', 'kitty cat'];
let wordFilter2 = preprocessWordLists(badwords2, whitelist2);
```
### Detecting If There Is a Bad Word
```js
import { doesContainBadWords } from 'deep-profanity-filter';

let inputString = 'This is some example text about my kitty cat.';
if (doesContainBadWords(inputString, wordFilter)) {
	console.log('Found a bad word!');
} else {
	console.log('No bad word found.'); // Or all bad words whitelisted.
}
// Output:
// Found a bad word!
```
```js
// Optionally, with override data:
if (doesContainBadWords(inputString, wordFilter, overrideData)) {
	console.log('Found a bad word!');
} else {
	console.log('No bad word found.');
}
// Output:
// No bad word found.
```
### Finding a Bad Word in an Input
```js
import { findAnyBadWord } from 'deep-profanity-filter';

const badWord = findAnyBadWord('test input string about a kitty', wordFilter);
if (badWord) {
	console.log('Found a bad word: ', badWord);
} else {
	console.log('No bad word found.'); // Or all bad words whitelisted.
}
// Output:
// Found a bad word:  kitty
```
```js
// Optionally, with override data:
const badWord2 = findAnyBadWord('test input string about a kitty', wordFilter, overrideData);
if (badWord) {
	console.log('Found a bad word: ', badWord);
} else {
	console.log('No bad word found.'); // Or all bad words whitelisted.
}
// Output:
// Found a bad word:  kitty
```
### Finding All Bad Words in an Input
```js
import { findAllBadWords } from 'deep-profanity-filter';

const badWords = findAllBadWords('hell kitty cat is my fav word!!!', wordFilter);
if (badWords.length > 0) {
	console.log('Found bad words: ', badWords);
} else {
	console.log('No bad words were found.'); // Or all bad words whitelisted.
}
// Output:
// Found bad words:  [ 'kitty', 'hell*', '*word*' ]
```
```js
// Optionally, with override data:
const badWords2 = findAllBadWords('hell kitty cat is my fav word!!!', wordFilter, overrideData);
if (badWords2.length > 0) {
	console.log('Found bad words: ', badWords);
} else {
	console.log('No bad words were found.'); // Or all bad words whitelisted.
}
// Output:
// Found bad words:  [ 'hell*', '*word*' ] // "kitty cat" was whitelisted
```
### Replacing all Bad Words in an Input
If you wish to replace all bad words in a text in order to "sanitise" it, but you have no need for a list of all bad words, you can use `censorText`:
```js
import { censorText } from 'deep-profanity-filter';

// This is grawlix replacement:
console.log(censorText('cute kitty cat', wordFilter)); // cute #&?£& cat

// Word replacement preserves special characters and spacing in circumventions
console.log(censorText('oh he.l-l, what a kit~ty! my w o r d!?!', wordFilter));
// oh %£.?-£, what a #&?~£&! my ! % $ ?!?!
```
```js
// Optionally, with override data:
console.log(censorText('oh hell, what a kitty cat! my word!', {}, overrideData));
// oh %£?£, what a kitty cat! my !%$?!
```
If you wish to **at the same time query a list of all bad words**, use `findBadWordLocations` along with `replaceBadWords` and `getBadWords` instead to ensure better runtime efficiency:
```js
import { findBadWordLocations, getBadWords, replaceBadWords } from 'deep-profanity-filter';

let inputStrings = ['cute kitty cat',
	'oh he.l-l, what a kit~ty! my w o r d!?!'];
for (const str of inputStrings) {
	let locations = findBadWordLocations(str, wordFilter);
	// with override data: locations = findBadWordLocations(str, wordFilter, { overrideData });
	console.log('Testing input string: "' + str + '"');
	console.log('Bad words found:', getBadWords(locations)); // [ 'kitty' ];
	console.log('Output: "' + replaceBadWords(str, locations) + '"'); // cute #&?£& cat
}
// Output:
// Testing input string: "cute kitty cat"
// Bad words found:  [ 'kitty' ]
// Output: "cute #&?£& cat"
// Testing input string: "oh he.l-l, what a kit~ty! my w o r d!?!"
// Bad words found:  [ 'kitty', 'hell*', '*word*' ]
// Output: "oh %£.?-£, what a #&?~£&! my ! % $ ?!?!"
```
#### Preprocessing inputs for replacement:
`censorText` has simplified settings for preprocessing the input, while `replaceBadWords(str, findBadWordLocations(str, filter))` offers more flexibility, but also more responsibility to preprocess things.
For simplicity, `censorText` per default filters case insensitively while retaining uppercase and lowercase of the input string:
```js
console.log(censorText('Cute Kitty Cat', wordFilter)); // Cute #&?£& Cat
// which is equivalent to:
console.log(censorText('Cute Kitty Cat', wordFilter, {
	inputPreprocessMethod: InputPreprocessMethod.CaseInsensitive,
})); // Cute #&?£& Cat

// Note, it can't deal with special unicode characters.
// For that, use InputPreprocessMethod.Thorough (more info below)
console.log(censorText('𝒞𝓊𝓉𝑒 𝒦𝒾𝓉𝓉𝓎 𝒞𝒶𝓉', wordFilter)); // 𝒞𝓊𝓉𝑒 𝒦𝒾𝓉𝓉𝓎 𝒞𝒶𝓉
```
The same can be achieved with:
```js
const input = 'Cute Kitty Cat';
const lowerCaseString = input.toLowerCase();
const locations = findBadWordLocations(lowerCaseString, wordFilter);
console.log(replaceBadWords(input, locations)); // Cute #&?£& Cat
```
Case sensitivity can be purposefully turned off, in which cases words are only recognised if they directly match with the words defined in the bad word list: *(This is not recommended and therefore not the default setting.)*
```js
console.log(censorText('Cute Kitty Cat', wordFilter, {
	inputPreprocessMethod: InputPreprocessMethod.ExactMatch,
})); // Cute Kitty Cat
console.log(censorText('Cute kitty Cat', wordFilter, {
	inputPreprocessMethod: InputPreprocessMethod.ExactMatch,
})); // Cute #&?£& Cat

// Or equivalently:
const locationsBad = findBadWordLocations('Cute Kitty Cat', wordFilter);
// (finds nothing as it is not lower case)
console.log(replaceBadWords('Cute Kitty Cat', locationsBad)); // Cute Kitty Cat

const locationsOk = findBadWordLocations('Cute Kitty Cat'.toLowerCase(), wordFilter);
console.log(replaceBadWords('Cute Kitty Cat', locationsOk)); // Cute #&?£& Cat
console.log(replaceBadWords('Cute Kitty Cat'.toLowerCase(), locationsOk)); // cute #&?£& cat
```
If you are looking for a thorough filter, including fancy 𝓤𝓷𝓲𝓬𝓸𝓭𝓮 𝔸𝕝𝕡𝕙𝕒𝕓𝕖𝕥𝕤 and emoji letters being parsed as well, this is supported in a special setting as well. This is equivalent to using `textToLatin` on the input.
*(Currently, it will turn the output of censorText to lower case latin letters if any emojis or fancy unicode text are found in the text, as emojis and fancy alphabets can have a different character count to the latin letters they translate to and that is difficult to replace while keeping the rest of the text in the correct formatting.)*
```js
console.log(censorText('Cute Kitty Cat', wordFilter, {
	inputPreprocessMethod: InputPreprocessMethod.Thorough,
})); // Cute #&?£& Cat
console.log(censorText('𝒞𝓊𝓉𝑒 𝒦𝒾𝓉𝓉𝓎 𝒞𝒶𝓉', wordFilter, {
	inputPreprocessMethod: InputPreprocessMethod.Thorough,
})); // cute #&?£& cat
console.log(censorText('𝒞𝓊𝓉𝑒 kitty cat', wordFilter, {
	inputPreprocessMethod: InputPreprocessMethod.Thorough,
})); // cute #&?£& cat

// or equivalently:
const input = textToLatin('𝒞𝓊𝓉𝑒 𝒦𝒾𝓉𝓉𝓎 𝒞𝒶𝓉'); // cute kitty cat
console.log(replaceBadWords(input, findBadWordLocations(input, wordFilter))); // cute #&?£& cat
```
Additionally to all these preprocessing methods, there is also an integrated way to use the `reduceRepeatCharacters` function within the `censorText` function via the `reduceRepeatCharactersTo` field value.
**This value needs to be an integer number larger than 0, otherwise an exception is thrown.**
It is `undefined` per default, which means repeat characters in the input are not removed.
```js
console.log(censorText('cute kittttttttty cat', wordFilter, {
	reduceRepeatCharactersTo: 2, // parses the input as "cute kitty cat"
})); // cute #&?£& cat
console.log(censorText('cute kittttttttty cat', wordFilter, {
	reduceRepeatCharactersTo: 3, // parses the input as "cute kittty cat" -> does not find a bad word
})); // cute kittttttttty cat
console.log(censorText('cute kittttttttty cat', wordFilter, {
	reduceRepeatCharactersTo: 1, // parses the input as "cute kity cat" -> does not find a bad word
})); // cute kittttttttty cat
```
Do note that reducing repeat characters (fully explained below in the input preprocessing chapter) is a very powerful preprocessing method that can (and likely _will_) lead to false positives if used wrong. **Do make sure to familiarise yourself with the implications of this parameter in the Input Preprocessing section below, before using it.**
#### Varying the Replacement Characters:
If you don't want to replace your bad words with grawlix `%&$#?£@!` characters, you can also choose to replace the words with a single repeated character:
```js
import { censorText, WordReplacementType } from 'deep-profanity-filter';

// Repeat character replacement:
console.log(censorText('cute kitty cat', wordFilter, {
	replacementType: WordReplacementType.RepeatCharacter,
})); // cute ----- cat

// Specifying a custom repeat character:
console.log(censorText('cute kitty cat', wordFilter, {
	replacementType: WordReplacementType.RepeatCharacter,
	replacementRepeatCharacter: '*',
})); // cute ***** cat
```
This also works as an argument on `replaceBadWords`.
#### Keeping the First or Last Characters of the Bad Word
If you don't wish to replace the full word, you can also choose to keep the first, or the first and last characters intact.
```js
import { censorText, WordReplacementMethod, WordReplacementType } from 'deep-profanity-filter';

console.log(censorText('cute kitty cat', wordFilter, {
	replacementType: WordReplacementType.RepeatCharacter,
	replacementMethod: WordReplacementMethod.KeepFirstCharacter,
})); // cute k---- cat

console.log(censorText('cute kitty cat', wordFilter, {
	replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
})); // cute k&?£y cat
```
This again also works as an argument on `replaceBadWords`.
#### With Override Data:
```js
// With any word list override data, the syntax is as follows:
censorText(inputString, wordFilter, {/*options*/}, overrideData);
```
### Input Preprocessing
```js
import { unEmoji, removeTextAccents, textToLatin } from 'deep-profanity-filter';

// unEmoji converts unicode emojis with text or letters on them
// it cannot convert other special unicode characters or accented characters
console.log(unEmoji('🇬⭕ 🔛')); // "go on"
console.log(unEmoji('🅿🇺®️💰🇪')); // "purse"
console.log(unEmoji('à-côtés')); // "à-côtés" - no changes
console.log(unEmoji('ᑕⓞ֑ο̤͕𝕃ܑׅ')); // "ᑕⓞ֑ο̤͕𝕃ܑׅ" - no changes

// removeTextAccents removes most common accents on characters
// it cannot convert emojis or other special unicode characters
// it works well with "Zalgo" type text
// it preserves upper case and lower case characters
console.log(removeTextAccents('🇬⭕ 🔛')); // "🇬⭕ 🔛"
console.log(removeTextAccents('🅿🇺®️💰🇪')); // "🅿🇺®️💰🇪"
console.log(removeTextAccents('à-côtés')); // "a-cotes"
console.log(removeTextAccents('ᑕⓞ֑ο̤͕𝕃ܑׅ')); // "ᑕⓞο𝕃"
console.log(removeTextAccents('Z̵̡̭͝ả̶̬̘̈́l̶̜͗g̵̜̲͒́o̶̞̅̊')); // "Zalgo"

// textToLatin combines unEmoji and removeTextAccents, and also
// transforms many (but likely not all) special unicode characters
// to their perceptually most similar latin counterpart
// it also turns your output to lowercase
console.log(textToLatin('🇬⭕ 🔛')); // "go on"
console.log(textToLatin('🅿🇺®️💰🇪')); // "purse"
console.log(textToLatin('à-côtés')); // "a-cotes"
console.log(textToLatin('ᑕⓞ֑ο̤͕𝕃ܑׅ')); // "cool"
console.log(textToLatin('Z̵̡̭͝ả̶̬̘̈́l̶̜͗g̵̜̲͒́o̶̞̅̊')); // "zalgo"

console.log(textToLatin('thē ๑นi¢k ๖r໐ຟຖ f໐x วน๓pŞ ໐งēr thē lคຊฯ ໓໐ງ.'));
console.log(textToLatin('𝕿𝖍𝖊 𝖖𝖚𝖎𝖈𝖐 𝖇𝖗𝖔𝖜𝖓 𝖋𝖔𝖝 𝖏𝖚𝖒𝖕𝖘 𝖔𝖛𝖊𝖗 𝖙𝖍𝖊 𝖑𝖆𝖟𝖞 𝖉𝖔𝖌.'));
console.log(textToLatin('🆃🅷🅴 🆀🆄🅸🅲🅺 🅱🆁🅾🆆🅽 🅵🅾🆇 🅹🆄🅼🅿🆂 🅾🆅🅴🆁 🆃🅷🅴 🅻🅰🆉🆈 🅳🅾🅶.'));
console.log(textToLatin('ₜₕₑ qᵤᵢcₖ bᵣₒwₙ fₒₓ ⱼᵤₘₚₛ ₒᵥₑᵣ ₜₕₑ ₗₐzy dₒg.'))
// the quick brown fox jumps over the lazy dog.
```
Note: Input Preprocessing is a computationally expensive operation, due to the amount of unicode characters that the input is being compared against. Be aware that if you use this feature in large scales (to check many messages per second), it can slow down your program.

*Runtime optimisations can be done in the code, but are not being done for the first version of this package, as pushing out a version that works is the first priority. They will be considered in future versions. (Feel free to contribute, if you want to.)*
#### Reducing Repeat Characters
This library provides a function to reduce the amount of times the same character repeats itself in any given input. The following examples explain its functionality best:
```js
import { reduceRepeatCharacters } from 'deep-profanity-filter';
console.log(reduceRepeatCharacters('ttttteeeessstting', 1)); // testing
console.log(reduceRepeatCharacters('ttttteeeessstting', 2)); // tteesstting
console.log(reduceRepeatCharacters('ttttteeeessstting', 3)); // ttteeessstting
console.log(reduceRepeatCharacters('ttttteeeessstting', 4)); // tttteeeessstting
console.log(reduceRepeatCharacters('kittty', 4)); // kittty
console.log(reduceRepeatCharacters('kittty', 3)); // kittty
console.log(reduceRepeatCharacters('kittty', 2)); // kitty
console.log(reduceRepeatCharacters('kittty', 1)); // kity

// Note: the input number needs to be an integer larger than 0, else it throws an error!
console.log(reduceRepeatCharacters('kittty', 0)); // !!! Throws Error
console.log(reduceRepeatCharacters('kittty', -1)); // !!! Throws Error
console.log(reduceRepeatCharacters('kittty', 1.5)); // !!! Throws Error
console.log(reduceRepeatCharacters('kittty', 4/3)); // !!! Throws Error
```
**Note:** If you set your value to `1`, this will likely cause false positives, as a lot of words such as `loot -> lot` would get misinterpreted. For most languages, setting the value to `2` or `3` is best. (Also, when using this approach in conjunction with wildcards in your bad words, you may end up finding lots of unexpected false positives.)

**Note:** If you use this to preprocess every input string before testing for bad words, your bad word list (and corresponding list of allowed words) should not feature more than the amount of repeating characters specified or they will be ineffective. That is, if you use the value `2` across the board, putting `princessship` on the bad word list will have no effect since any input string with this word would see this word reduced to `princesship`.
### Message Censoring Example
```js
import { doesContainBadWords, preprocessWordLists, textToLatin } from 'deep-profanity-filter';

const badwords = ['*word']
const whitelist = ['badword']
const wordFilter = preprocessWordLists(badwords, whitelist);

function censorMessages = (inputString) => {
	if (doesContainBadWords(textToLatin(inputString), wordFilter)) {
		// delete the message
	}
}
```

# In-Depth: How to Create Your Wordlist
Setting up your word list can be a daunting task. By covering most common circumventions, this library hopes to make it a bit easier. Instead of collating countless variations of spellings, interjecting special characters, etc. this library covers most cases for you, as explained in this section.
*Note: This library does not consider replacing numbers with characters. Leet-speak (or L33t) is something you need to cover manually, as it usually generates false positives when parsing URLs.*

Bad words can contain full words such as `kitty`, as well as words with wildcards at start, end or both, such as `hell*`, `*word*` or `*licious`. You can also provide phrases with several words, such as `ban ananas`.

## Finding a Standalone Word (No Wildcards)
Without wildcards, it will match words only when the full word is properly distinguishable. In the case of `kitty`, the following variations will be considered as bad words:
- The word itself, surrounded by special characters or spaces, for example:
`kitty`, `-kitty`, `kitty-`, `-kitty-`, `.kitty`, `||kitty||` , `kitty cat`, `cute kitty`, etc.
- The word, separated by non-spaces to other words, such as:
`cute-kitty`, `cute/kitty`, `kitty!cat`, `cute%kitty_cat`, etc.
- **If circumventions are being checked**: the word, with some characters separated by non-whitespace non-alphabet characters, such as:
`k+itty`, `ki.tty`, `kit-ty`, `kitt~y`, `k&it_ty`, etc.
- **If circumventions are being checked**: the word, with all characters spaced out by either spaces or special characters, such as:
`k i t t y`, `k    i...t_ t - y`, `'k-i-t-t-y'`, `k.i.t.t.y`, `cute k i t t y`, `k-i-t-t-y cat`, etc.

The following variations however, will not consider it a standalone word and **__not__** recognise it:
- The word, directly connected to another word or letter:
`cutekitty`, `kittycat`, `akitty`, `kittys`, etc.
- The word, interjected with spaces between some, but not all characters:
`k itty`, `ki tty`, `kit ty`, `k i t..ty`, etc. (these could form valid words.)
- The word, with all characters spaced out, if preceded or followed up by more spaced out characters, such as:
`k i t t y c a t`, `c u t e k i t t y`, `t h e k i t t y` or `k i t t y s`, etc.

### Whitelisting Standalone Words
To whitelist a standalone word, any word or phrase containing the bad word will work. Try adding `hello kitty` to your whitelist, and you'll see that phrases such as the following are no longer recognised as bad words:
- `hello kitty`, `hello kitty hello kitty`, `hello-kitty`, `hello...kitty`, `hello/kitty`, `h e l l o k i t t y`, etc.

You can also whitelist words with wildcards, such as `kittys*`, which would allow word any word starting with `kittys` such as:
- `kittys`, `kittysarecute`, `kittyspawn`, `k i t t y s q u i s h`, etc.

## Finding Word Beginnings (Words Ending in a Wildcard*)
If you check for a word with a wildcard character `*` at its end, it will match all words beginning with your search term. In the case of `hell*`, the following words are recognised as bad words:
- `hell`, `hello`, `hellhole`, `hell-o`, `hell hole`, `hell-hole`, `h e l l i s h`, etc.
 
However, the following terms are **__not__** counted as bad words:
- `shell`, `shellfish`, `s h e l l`, `s h e l l f i s h`

### Whitelisting Word Beginnings
To whitelist these, it's usually recommended to also end your whitelist in a wildcard. For example, if you choose to whitelist `shell` and `hello`, the following are allowed:
- `shell`, `s h e l l`, `hello`, `h e l l o`

While the following are still bad words:
- `shellfish`, `s h e l l f i s h`, `helloo`, etc.

Thus, whitelisting `shell*` and `hello*` is more reasonable in that case.

## Finding Word Endings (Word Starting in a \*Wildcard)
If you check for a word with a wildcard character `*` at its start, it will match word endings with your search term.
This is done similarly to the previous chapter.

## Finding Substrings (Words surrounded by \*Wildcards\*)
If you check for a word with a wildcard character `*` at either end, it will look for any word containing your search term. In the case of `*word*`, the following would be recognised as bad words:
- `word`, `sword`, `wording`, `passwords`, etc.

**__Note that searching for words like this can lead to many false positives, so be sure to only use this method to search for the worst offenders, especially when used with short words of 4 or less characters!__** *(Short words of 4 or less characters can randomly appear in links or keyboard-smashes.)*

### Whitelisting Substrings
For whitelisting, in any case, it is important to include the whole search term in it. You can, but don't have to add wildcards to the whitelist's start and end.
- If we whitelist a full word, such as `keyword`, other words such as `keywords` or `mykeyword` will still be recognised as bad words.
- If we whitelist a word start, such as `loanword*`, it whitelists terms such as `loanwords`, `loanwording`, etc. but terms like `myloanword`, `myloanwords`, `myloanwording` will still be recognised as bad words.
- If we whitelist a word end, such as `*wording`, it whitelists terms such as `bad wording`, `badwording` or `somebadwording`, but it does still count `badwordings` or `badwordingsarebad`, etc. as bad words.
- If we whitelist another substring, such as `*sword*`, it'll cover all cases and allow words like `sword`, `miswording`, `longsword`, `swordfight`, etc.

It can be tricky to find all the right terms to whitelist, so use wildcards with care.
## Checking Whitelisted Strings for Validity
In order to check whether a whitelisted string is valid and whitelists a term, a helper function `isValidWhitelist` can be used. This may prove useful in at least two cases:
- If you allow other users to build a word list, you can use this function to give them feedback on whether their whitelisted terms are carrying any effect.
- If you wish to test whether a certain bad word covers a bad word or phrase, `isValidWhitelist`  does that check for you. If a phrase would be a valid whitelist for a term, it means that it's considered a bad word/phrase if you do not whitelist it.

**Note: Terms whitelist a bad word if they cover the bad word itself, or if they cover a subset of the words covered by a bad word.** This means if your bad word is `hell*` and you whitelist `he*`, this would theoretically make the bad word `hell*` useless as a bad word. Therefore this term will be considered a __user error__ and the tool does not consider it as valid.
See the following example code to get a clearer understanding of it:
```js
import { isValidWhitelist } from 'deep-profanity-filter';

console.log(isValidWhitelist('hell', 'hell*')); // true
console.log(isValidWhitelist('hello', 'hell*')); // true
console.log(isValidWhitelist('hello*', 'hell*')); // true
console.log(isValidWhitelist('hellman', 'hell*')); // true
console.log(isValidWhitelist('hello kitty', 'kitty')); // true
console.log(isValidWhitelist('kitty cat', 'kitty')); // true

// The function only compares one bad word with one good word.
console.log(isValidWhitelist('goodword', 'badword')); // false - no overlap
console.log(isValidWhitelist('hell', 'kitty')); // false - no overlap
console.log(isValidWhitelist('kitty', 'hell*')); // false - no overlap

// The function is intended to provide clarity on which whitelisted terms are
// reasonable and valid. Whitelisting terms that would not have been considered bad
// with the given bad word will return "false" by this function.
console.log(isValidWhitelist('hello', 'hell')); // false
console.log(isValidWhitelist('shell', 'hell*')); // false
console.log(isValidWhitelist('kittycat', 'kitty*')); // true
console.log(isValidWhitelist('kittycat', 'kitty')); // false
console.log(isValidWhitelist('hellokitty', 'kitty*')); // false

// Whitelist terms that fully negate a bad word will be considered "false",
// since in that case, it makes more sense to remove the bad word itself.
// This is considered a user error and likely happens unintentionally.
console.log(isValidWhitelist('loanword*', 'loanwords')); // false
console.log(isValidWhitelist('h*', 'hell*')); // false
console.log(isValidWhitelist('he*', 'hell*')); // false
console.log(isValidWhitelist('hel*', 'hell*')); // false

// The only exception to this is whitelisting the exact bad word itself, both since
// it is mathematically part of the subset and because this case is likely intentional
console.log(isValidWhitelist('hell*', 'hell*')); // true
console.log(isValidWhitelist('badword', 'badword')); true
```
### Checking circumvention whitelists:
When creating your word list with `preprocessWordLists`, three parameters can be passed to tweak whether and how to handle circumventions: `checkCircumventions`, `considerPrecedingApostrophes` and `considerFollowUpApostrophes`.
The same three parameters can be passed into this function. As for apostrophe handling, the effects of these parameters being `true` or `false` is explained in detail in the next section. It applies both to wordlists as well as whitelist checks.
**Note: the recommendation is to use the same values for testing your whitelist as you use for creating your word list, to get accurate results.**
```js
// To check with or without circumventions, you can set the checkCircumventions flag to true or false
console.log(isValidWhitelist('he^ll', 'hell', { checkCircumventions: false })); // false
console.log(isValidWhitelist('he^ll', 'hell', { checkCircumventions: true })); // true
console.log(isValidWhitelist('h e l l', 'hell', { checkCircumventions: true })); // true
console.log(isValidWhitelist('h-e-l-l', 'hell', { checkCircumventions: true })); // true
console.log(isValidWhitelist('h^e.l l', 'hell', { checkCircumventions: true })); // true
console.log(isValidWhitelist('s h e l l', 'hell', { checkCircumventions: true })); // false (parsed as "shell")
console.log(isValidWhitelist('h e l l o', 'hell', { checkCircumventions: true })); // false (parsed as "hello")

// All three flags are per default set to true, so if you are checking for circumventions,
// you can omit the additional flags. If you specifically wish to NOT check circumventions, you'll need it.
console.log(isValidWhitelist('he^ll', 'hell')); // true
console.log(isValidWhitelist('h e l l', 'hell')); // true
console.log(isValidWhitelist('h-e-l-l', 'hell')); // true
console.log(isValidWhitelist('h^e.l l', 'hell')); // true
```
**__Note: All whitelist terms that return false here will have no whitelisting effect on that specific bad word when using this library, as this function is also used internally to create the mapping of whitelisted terms to bad words.__**
## Apostrophe Handling
When setting up the word lists, there are two optional settings on how to handle apostrophes in `s p a c e d` out words.
*Please note that these are very rare use cases, as it is not usually normal for people to write everything with spaces or special characters between each letter, but it **can** happen, especially when people are trying to circumvent your filter. As it is such a rare case, you have to decide for yourself whether you want to be a bit more careful and risk accidenally treating a good word as bad, if it is spelled unfortunately with apostrophes, or whether you want to be more lax in these cases.*

### Invariables
No matter how you decide to handle apostrophes, and given the example of a bad word `kitty`:
- `cute'k i t t y`, `k i t t y'cat`, `k i t t y'ed`, etc. will be considered a bad word, and
- `c u t e'k i t t y` will be parsed as `"cutekitty"` and be considered as **__not__** a bad word.

### Default Setting
In the default settings, we consider both apostrophes before and after spaced characters to "break the pattern". This setting is recommended for use with English inputs.
```js
preprocessWordLists(badwords, whitelist);
// or (with redundancy)
preprocessWordLists(badwords, whitelist, {
	considerPrecedingApostrophes: true,
	considerFollowUpApostrophes: true,
});
```
This means that, given the bad word `kitty`, the following phrases are considered **__bad words__** as well:
- `it's k i t t y`
- `a cutes't k i t t y`
- `so I'd k i t t y`
- `c u t'e k i t t y` *(might be a good word, as `cutekitty` is not bad either)*
- `c'u't'e'k'i't't'y` *(same reasoning)*
- `k i t t y's`
- `k i t t y'c a t` *(might be a good word, as `kittycat` is not bad either)*
- `k'i't't'y'c'a't` *(same reasoning)*

### Alternate Preceding Apostrophe Handling
In this setting, we consider preceding apostrophes to be treated like any other special character or whitespace.
```js
// use this code to allow certain phrases with alternate preceding apostrophes
preprocessWordLists(badwords, whitelist, {
	considerPrecedingApostrophes: false,
});
```
This means that, given the bad word `kitty`, the following phrases are considered **__bad words__**:
- `k i t t y's`
- `k i t t y'c a t` *(might be a good word, as `kittycat` is not bad either)*
- `k'i't't'y'c'a't` *(same reasoning)*

The following words are **__not__** being recognised as bad words:
- `it's k i t t y` *(looks like a bad word to me, but gets parsed as `skitty`)*
- `a cutes't k i t t y` *(same reasoning, gets parsed as `tkitty`)*
- `so I'd k i t t y` *(same reasoning, gets parsed as `idkitty`)*
- `c u t'e k i t t y`
- `c'u't'e'k'i't't'y` 

### Alternate Followup Apostrophe Handling
In this setting, we consider apostrophes after the word to be treated like any other special character or whitespace.
```js
// use this code to allow certain phrases with alternate follow-up apostrophes
preprocessWordLists(badwords, whitelist, {
	considerFollowUpApostrophes: false,
});
```
This means that, given the bad word `kitty`, the following phrases are considered **__bad words__**:
- `it's k i t t y`
- `a cutes't k i t t y`
- `so I'd k i t t y` 
- `c u t'e k i t t y` *(might be a good word, as `cutekitty` is not bad either)*
- `c'u't'e'k'i't't'y` *(same reasoning)*

The following words are **__not__** being recognised as bad words:
- `k i t t y's` *(looks like a bad word to me, but gets parsed as `kittys`)*
- `k i t t y'c a t`
- `k'i't't'y'c'a't`

### Alternate Apostrophe Handling on Both Sides
In this setting, we consider apostrophes the same as whitespace or other special characters. Singular characters separated with apostrophes are getting read like a full word, and if we parse without wildcards, such as the example with `kitty`, it reads followup letters as if they are part of the spaced word, so `a's k i t t y` or `k i t t y s` will be parsed as `askitty` and `kittys` and not trigger the bad word filter.
```js
// use this code to parse apostrophes like other non-word characters
preprocessWordLists(badwords, whitelist, {
	considerPrecedingApostrophes: false,
	considerFollowUpApostrophes: false,
});
```
In this case, all the examples stated previously are **__not__** considered bad words:
- `it's k i t t y` *(looks like a bad word to me, but gets parsed as `skitty`)*
- `a cutes't k i t t y` *(same reasoning, gets parsed as `tkitty`)*
- `so I'd k i t t y` *(same reasoning, gets parsed as `idkitty`)*
- `c u t'e k i t t y`
- `c'u't'e'k'i't't'y` 
- `k i t t y's` *(looks like a bad word to me, but gets parsed as `kittys`)*
- `k i t t y'c a t`
- `k'i't't'y'c'a't`

### Conclusion
However you want to handle apostrophes is up to you, and how careful you wish to be. It is nigh impossible to build a model that efficiently and reliably only catches the things that the human eye would consider "bad" without accidentally catching a few good cases at the same time.
If you find a better solution to handle apostrophes, contact me.

# Where to Find Word Lists
You may notice that there is no word list provided with this tool. It is designed to be flexible enough for you to build your own list, or to take provided lists from the internet. The wildcards work the same as Discord's AutoMod handles them, so if you're looking for a general profanity filter word list, you can start searching for lists for that.
As this tool handles a lot of circumvention cases, be aware that you can reduce your lists to normal words and a few alternate spelling variations, but common circumventions such as `a.d.d.i.n.g` dots or dashes between the characters is unnecessary with this tool, as it already parses for this content.

If you've read until here, thanks! You're a champ! If you like this library (and can spare a coin) consider to [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/B0B0MH76V)
