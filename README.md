# deep-profanity-filter
A thorough profanity filter that considers most common circumventions.
Works with your custom list of blocked and whitelisted words and phrases.
Allows preprocessing input strings to latinise many fancy unicode alphabets.

## Installation
`npm install deep-profanity-filter`

## Contents
This package can be divided into three parts:
1. **Setting Up a List of Words**
How to provide words or phrases, and what gets detected as a bad word given your list of words.
How to provide whitelisted terms to allow certain words or phrases as exceptions.
How to do on the fly changes to your list.
2. **Detecting Words from the List**
How to use the tool to detect bad content, given your bad word list and whitelist.
3. **Input Preprocessing**
How to use the tool to translate letter emojis or fancy 𝓤𝓷𝓲𝓬𝓸𝓭𝓮 𝔸𝕝𝕡𝕙𝕒𝕓𝕖𝕥𝕤 to latin letters.

In the following section there will first be an explanation on how to do these things in JavaScript or TypeScript code, followed by some in-depth examples of what words and circumventions may get detected as bad words with some given input words.

# Code Usage
### Setting Up a List of Words
```js
import { preprocessWordLists } from 'deep-profanity-filter';

let badwords = ['kitty', 'hell*', '*word*', 'ban ananas'] // example
let whitelist = ['hello kitty', 'hello*', 'ban ananas juice', 'keyword', 'loanword*', '*sword*', '*wording'] // example

// This wordFilter is what we use to then test any input string with
let wordFilter = preprocessWordLists(badwords, whitelist);
```
Alternately, you can also change some fine-tuned settings on how to handle apostrophes in `s p a c e d` content. You can read up on the implications of these in this readme. For filtering English content, it is recommended to leave both values on their defaults. For other languages you may benefit from setting one or both value to false.
```js
const considerPrecedingApostrophes = false; // per default it's set to true
const considerFollowUpApostrophes = false; // per default it's set to true
let wordFilter = preprocessWordLists(badwords, whitelist,
	considerPrecedingApostrophes, considerFollowUpApostrophes);
```

### Changing The Word Lists
```js
// When changing your word lists, always regenerate the filter
// using preprocessWordLists(...)
badwords.push("newbadword");
whitelist.push("newbadword but good");
wordFilter = preprocessWordLists(badwords, whitelist /*, apostrophe settings*/);
```

### Detecting Words From the List
```js
import { doesContainBadWords } from 'deep-profanity-filter';

let inputString = 'This is some example text about my kitty cat.';
if (doesContainBadWords(inputString, wordFilter)) {
	// the string contained a bad word!
} else {
	// no bad words were found or all were whitelisted!
}
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

### Message Censoring Example
```js
import {doesContainBadWords, preprocessWordLists, textToLatin } from 'deep-profanity-filter';

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
- The word, with all characters spaced out by either spaces or special characters, such as:
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

**__Note that searching for words like this can lead to many false positives, so be sure to only use this method to search for the worst offenders, and avoid using it with short words of 4 or less characters!__** *(Short words of 4 or less characters can randomly appear in links or keyboard-smashes.)*

### Whitelisting Substrings
For whitelisting, in any case, it is important to include the whole search term in it. You can, but don't have to add wildcards to the whitelist's start and end.
- If we whitelist a full word, such as `keyword`, other words such as `keywords` or `mykeyword` will still be recognised as bad words.
- If we whitelist a word start, such as `loanword*`, it whitelists terms such as `loanwords`, `loanwording`, etc. but terms like `myloanword`, `myloanwords`, `myloanwording` will still be recognised as bad words.
- If we whitelist a word end, such as `*wording`, it whitelists terms such as `bad wording`, `badwording` or `somebadwording`, but it does still count `badwordings` or `badwordingsarebad`, etc. as bad words.
- If we whitelist another substring, such as `*sword*`, it'll cover all cases and allow words like `sword`, `miswording`, `longsword`, `swordfight`, etc.

It can be tricky to find all the right terms to whitelist, so use wildcards with care.

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
// or
preprocessWordLists(badwords, whitelist, true, true);
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
preprocessWordLists(badwords, whitelist, false, true);
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
preprocessWordLists(badwords, whitelist, true, false);
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
preprocessWordLists(badwords, whitelist, false, false);
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
