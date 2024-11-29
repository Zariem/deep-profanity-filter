import {
  preprocessWordLists,
  doesContainBadWords,
  unEmoji,
  removeTextAccents,
  textToLatin,
  findAnyBadWord,
  findAllBadWords,
  getBadWords,
  findBadWordLocations,
  replaceBadWords,
  WordReplacementMethod,
  WordReplacementType,
  censorText,
  InputPreprocessMethod,
  preprocessWordListOverrideData,
  reduceRepeatCharacters,
  isValidWhitelist,
} from '../src';
import { escapeStringForRegex } from '../src/regex_handler';
import { grawlix } from '../src/replace_input';

const badwords = [
  'kitty',
  'hell*',
  '*word*',
  'ban ananas',
  '*this.is/a_link*',
  'link.co/',
  'a$$hole',
  '¯\\_(ツ)_/¯',
  '/(?:a)?fake(.)*regex$/',
  'שלום',
];
const goodwords = [
  'hello kitty',
  "kit'ty",
  'k-i.t~t-y',
  'hello*',
  'ban ananas juice',
  'keyword',
  'loanword*',
  '*sword*',
  '*wording',
];
const baplist = preprocessWordLists(badwords, goodwords);

console.log(baplist);
console.log(baplist.whitelistMap);

const baplistExact = preprocessWordLists(badwords, goodwords, { checkCircumventions: false });

const baplistVar1 = preprocessWordLists(badwords, goodwords, { considerPrecedingApostrophes: false });
const baplistVar2 = preprocessWordLists(badwords, goodwords, { considerFollowUpApostrophes: false });
const baplistVar3 = preprocessWordLists(badwords, goodwords, {
  considerPrecedingApostrophes: false,
  considerFollowUpApostrophes: false,
});

const overrideList1 = preprocessWordListOverrideData(
  baplist,
  ['hell*', 'link.co/'],
  ['ban ananas juice'],
  ['magic word*', 'something random'],
);

console.log('Override List: ', overrideList1);

test('filter standalone bad word', () => {
  expect(doesContainBadWords('kitty', baplist)).toEqual(true);
  expect(doesContainBadWords('-kitty', baplist)).toEqual(true);
  expect(doesContainBadWords('kitty-', baplist)).toEqual(true);
  expect(doesContainBadWords('-kitty-', baplist)).toEqual(true);
  expect(doesContainBadWords('.kitty', baplist)).toEqual(true);
  expect(doesContainBadWords('kitty.', baplist)).toEqual(true);
  expect(doesContainBadWords('.kitty.', baplist)).toEqual(true);
  expect(doesContainBadWords('||kitty||', baplist)).toEqual(true);
  expect(doesContainBadWords('kitty cat', baplist)).toEqual(true);
  expect(doesContainBadWords('kitty-cat', baplist)).toEqual(true);
  expect(doesContainBadWords('kitty!cat', baplist)).toEqual(true);
  expect(doesContainBadWords('kitty^cat', baplist)).toEqual(true);
  expect(doesContainBadWords('kitty/cat', baplist)).toEqual(true);
  expect(doesContainBadWords('cute kitty', baplist)).toEqual(true);
  expect(doesContainBadWords('cute-kitty', baplist)).toEqual(true);
  expect(doesContainBadWords('cute&kitty', baplist)).toEqual(true);
  expect(doesContainBadWords('cute%kitty', baplist)).toEqual(true);
  expect(doesContainBadWords("cute'kitty", baplist)).toEqual(true);
  expect(doesContainBadWords('cute+kitty-cat', baplist)).toEqual(true);
  expect(doesContainBadWords('cute kitty cat', baplist)).toEqual(true);
  expect(doesContainBadWords('kitty kitty kitty', baplist)).toEqual(true);
});

test('filter non-ASCII word', () => {
  expect(doesContainBadWords('שלום', baplist)).toEqual(true);
  expect(doesContainBadWords('שלום עליכם', baplist)).toEqual(true);
  expect(doesContainBadWords('עליכם', baplist)).toEqual(false);
});

test('only bap standalone word if without wildcards', () => {
  expect(doesContainBadWords('kittycat', baplist)).toEqual(false);
  expect(doesContainBadWords('cutekitty', baplist)).toEqual(false);
  expect(doesContainBadWords('cutekittycat', baplist)).toEqual(false);
  expect(doesContainBadWords('akitty', baplist)).toEqual(false);
  expect(doesContainBadWords('kittys', baplist)).toEqual(false);
  expect(doesContainBadWords('hellokitty', baplist)).toEqual(false);
});

test("spaces between some but not all characters don't bap", () => {
  expect(doesContainBadWords('k itty', baplist)).toEqual(false);
  expect(doesContainBadWords('ki tty', baplist)).toEqual(false);
  expect(doesContainBadWords('kit ty', baplist)).toEqual(false);
  expect(doesContainBadWords('kitt y', baplist)).toEqual(false);
  expect(doesContainBadWords('k it ty', baplist)).toEqual(false);
});

test('special character between some but not all characters', () => {
  expect(doesContainBadWords('k+itty', baplist)).toEqual(true);
  expect(doesContainBadWords('ki.tty', baplist)).toEqual(true);
  expect(doesContainBadWords('kit-ty', baplist)).toEqual(true);
  expect(doesContainBadWords('kitt~y', baplist)).toEqual(true);
  expect(doesContainBadWords('k&it_ty', baplist)).toEqual(true);
});

test("whitelisted phrase 'hello kitty'", () => {
  expect(doesContainBadWords('hello kitty', baplist)).toEqual(false);
  expect(doesContainBadWords('kitty hello kitty hello', baplist)).toEqual(true); // not all whitelisted
  expect(doesContainBadWords('hello kitty hello kitty', baplist)).toEqual(false);
  expect(doesContainBadWords('hello-kitty', baplist)).toEqual(false);
  expect(doesContainBadWords('hello-kitty', baplist)).toEqual(false);
  expect(doesContainBadWords('hello-kitty', baplist)).toEqual(false);
  expect(doesContainBadWords('hello   kitty', baplist)).toEqual(false);
  expect(doesContainBadWords('hello \n kitty', baplist)).toEqual(false);
  expect(doesContainBadWords('hello\nkitty', baplist)).toEqual(false);
  expect(doesContainBadWords("hello'kitty", baplist)).toEqual(false);
  expect(doesContainBadWords("hello'kitty", baplist)).toEqual(false);
});

test('spaced out characters get bapped', () => {
  expect(doesContainBadWords('k i t t y', baplist)).toEqual(true);
  expect(doesContainBadWords('k   i  t t  y', baplist)).toEqual(true);
  expect(doesContainBadWords('k-i-t-t-y', baplist)).toEqual(true);
  expect(doesContainBadWords("k.i-t't%y", baplist)).toEqual(true);
  expect(doesContainBadWords('k..i t/t<y', baplist)).toEqual(true);
  expect(doesContainBadWords('le      k i  t  t  y', baplist)).toEqual(true);
  expect(doesContainBadWords('a $ $ h o l e', baplist)).toEqual(true);
  expect(doesContainBadWords('a $ $ h o l e sa', baplist)).toEqual(true);
  expect(doesContainBadWords('as a $ $ h o l e', baplist)).toEqual(true);
  expect(doesContainBadWords('as a $ $ h o l e uwu', baplist)).toEqual(true);
});

test("spaced out character don't work if another spaced character follows", () => {
  expect(doesContainBadWords('k i t t y c u t e', baplist)).toEqual(false);
  expect(doesContainBadWords('c u t e k i t t y', baplist)).toEqual(false);
  expect(doesContainBadWords('a k i t t y', baplist)).toEqual(false);
  expect(doesContainBadWords('l e      k i  t  t  y', baplist)).toEqual(false);
  expect(doesContainBadWords('k i t t y s', baplist)).toEqual(false);
  expect(doesContainBadWords('a $ $ h o l e s', baplist)).toEqual(false);
  expect(doesContainBadWords('s a $ $ h o l e', baplist)).toEqual(false);
  expect(doesContainBadWords('a s a $ $ h o l e u w u', baplist)).toEqual(false);
});

test('Whitelisted circumventions', () => {
  expect(doesContainBadWords("kit'ty", baplist)).toEqual(false); // specifically whitelisted
  expect(doesContainBadWords('kit"ty', baplist)).toEqual(true);
  expect(doesContainBadWords("ki-t'ty", baplist)).toEqual(true);
  expect(doesContainBadWords('k-i.t~t-y', baplist)).toEqual(false); // specifically whitelisted
  expect(doesContainBadWords('k-i.t~t--y', baplist)).toEqual(true);
  expect(doesContainBadWords('k-it~t-y', baplist)).toEqual(true);
  expect(doesContainBadWords("k i  t ' t y", baplist)).toEqual(false); // specifically whitelisted
  expect(doesContainBadWords("k i  t' t y", baplist)).toEqual(true); // not fully spaced out - bap
  expect(doesContainBadWords("k i  t ' t-y", baplist)).toEqual(false);
  expect(doesContainBadWords("k-i--t-'-t-y", baplist)).toEqual(false);
  expect(doesContainBadWords('k - i . t ~ t - y', baplist)).toEqual(false); // specifically whitelisted
  // deviations from whitelist are ok as long as spaces between all characters
  expect(doesContainBadWords('k - i .-t ~ t - y', baplist)).toEqual(false);
  expect(doesContainBadWords('k - i.-t ~ t - y', baplist)).toEqual(true); // not fully spaced out - bap
  expect(doesContainBadWords('k--i^.t_~t^-y', baplist)).toEqual(true);

  expect(doesContainBadWords("kitty kit'ty", baplist)).toEqual(true);
  expect(doesContainBadWords("k i t t y kit'ty", baplist)).toEqual(true);
  expect(doesContainBadWords("kit'ty kitty", baplist)).toEqual(true);
  expect(doesContainBadWords("kit'ty k i t t y", baplist)).toEqual(true);
  expect(doesContainBadWords('kitty k-i.t~t-y', baplist)).toEqual(true);
  expect(doesContainBadWords('k i t t y k-i.t~t-y', baplist)).toEqual(false); // fully spaced out (parsed kittykitty)
  expect(doesContainBadWords('k i t t y is k-i.t~t-y', baplist)).toEqual(true); // not fully spaced out
  expect(doesContainBadWords('k-i.t~t-y kitty', baplist)).toEqual(true);
  expect(doesContainBadWords('k-i.t~t-y k i t t y', baplist)).toEqual(false);
  expect(doesContainBadWords('k-i.t~t-y is k i t t y', baplist)).toEqual(true);
  expect(doesContainBadWords('k-i.t~t-y ban ananas', baplist)).toEqual(true);
  expect(doesContainBadWords('k-i.t~t-y b a n a n a n a s', baplist)).toEqual(false);
  expect(doesContainBadWords('k-i.t~t-y is b a n a n a n a s', baplist)).toEqual(true);
});

test('checking only exact matches', () => {
  expect(doesContainBadWords('.kitty.', baplistExact)).toEqual(true);
  expect(doesContainBadWords('||kitty||', baplistExact)).toEqual(true);
  expect(doesContainBadWords('kitty cat', baplistExact)).toEqual(true);
  expect(doesContainBadWords('kitty-cat', baplistExact)).toEqual(true);
  expect(doesContainBadWords('kitty!cat', baplistExact)).toEqual(true);
  expect(doesContainBadWords('kitty^cat', baplistExact)).toEqual(true);
  expect(doesContainBadWords('kitty/cat', baplistExact)).toEqual(true);
  expect(doesContainBadWords('cute kitty', baplistExact)).toEqual(true);
  expect(doesContainBadWords('cute-kitty', baplistExact)).toEqual(true);

  expect(doesContainBadWords('k+itty', baplistExact)).toEqual(false);
  expect(doesContainBadWords('ki.tty', baplistExact)).toEqual(false);
  expect(doesContainBadWords('kit-ty', baplistExact)).toEqual(false);
  expect(doesContainBadWords('kitt~y', baplistExact)).toEqual(false);
  expect(doesContainBadWords('k&it_ty', baplistExact)).toEqual(false);

  expect(doesContainBadWords('k i t t y', baplistExact)).toEqual(false);
  expect(doesContainBadWords('k   i  t t  y', baplistExact)).toEqual(false);
  expect(doesContainBadWords('k-i-t-t-y', baplistExact)).toEqual(false);
  expect(doesContainBadWords("k.i-t't%y", baplistExact)).toEqual(false);
});

test('apostrophe handling', () => {
  expect(doesContainBadWords("it's k i t t y", baplist)).toEqual(true);
  expect(doesContainBadWords("a cutes't k i t t y", baplist)).toEqual(true);
  expect(doesContainBadWords("so i'd k i t t y", baplist)).toEqual(true); // i'd should count as id
  expect(doesContainBadWords("k i t t y's", baplist)).toEqual(true);
  expect(doesContainBadWords("k i t t y'ed", baplist)).toEqual(true);
  expect(doesContainBadWords("k i t t y'cute", baplist)).toEqual(true); // trailing apostrophe (drawback)
  expect(doesContainBadWords("k i t t y'c u t e", baplist)).toEqual(true); // trailing apostrophe (drawback)
  expect(doesContainBadWords("k'i't't'y'c'u't'e", baplist)).toEqual(true); // trailing apostrophe (drawback)
  expect(doesContainBadWords("c u t'e k i t t y", baplist)).toEqual(true); // preceding apostrophe (drawback)
  expect(doesContainBadWords("c u t e'k i t t y", baplist)).toEqual(false); // reading it as cutekitty
  expect(doesContainBadWords("cute'k i t t y", baplist)).toEqual(true); // preceding apostrophe (drawback)
  expect(doesContainBadWords("c'u't'e'k'i't't'y", baplist)).toEqual(true); // preceding apostrophe (drawback)
});

test('alternate preceding apostrophe handling', () => {
  expect(doesContainBadWords("it's k i t t y", baplistVar1)).toEqual(false); // reading as skitty
  expect(doesContainBadWords("a cutes't k i t t y", baplistVar1)).toEqual(false); // reading as tkitty
  expect(doesContainBadWords("so i'd k i t t y", baplistVar1)).toEqual(false); // reading it as idkitty
  expect(doesContainBadWords("k i t t y's", baplistVar1)).toEqual(true);
  expect(doesContainBadWords("k i t t y'ed", baplistVar1)).toEqual(true);
  expect(doesContainBadWords("k i t t y'cute", baplistVar1)).toEqual(true); // trailing apostrophe (drawback)
  expect(doesContainBadWords("k i t t y'c u t e", baplistVar1)).toEqual(true); // trailing apostrophe (drawback)
  expect(doesContainBadWords("k'i't't'y'c'u't'e", baplistVar1)).toEqual(true); // trailing apostrophe (drawback)
  expect(doesContainBadWords("c u t'e k i t t y", baplistVar1)).toEqual(false); // reading it as cutekitty
  expect(doesContainBadWords("c u t e'k i t t y", baplistVar1)).toEqual(false); // reading it as cutekitty
  expect(doesContainBadWords("cute'k i t t y", baplistVar1)).toEqual(true); // not starting in a single letter
  expect(doesContainBadWords("c'u't'e'k'i't't'y", baplistVar1)).toEqual(false); // reading it as cutekitty
});

test('alternate followup apostrophe handling', () => {
  expect(doesContainBadWords("it's k i t t y", baplistVar2)).toEqual(true);
  expect(doesContainBadWords("a cutes't k i t t y", baplistVar2)).toEqual(true);
  expect(doesContainBadWords("so i'd k i t t y", baplistVar2)).toEqual(true); // i'd should count as id
  expect(doesContainBadWords("k i t t y's", baplistVar2)).toEqual(false); // reading it as kittys
  expect(doesContainBadWords("k i t t y'ed", baplistVar2)).toEqual(true); // not ending in a single letter
  expect(doesContainBadWords("k i t t y'cute", baplistVar2)).toEqual(true); // not ending in a single letter
  expect(doesContainBadWords("k i t t y'c u t e", baplistVar2)).toEqual(false); // reading it as kittycute
  expect(doesContainBadWords("k'i't't'y'c'u't'e", baplistVar2)).toEqual(false); // reading it as kittycute
  expect(doesContainBadWords("c u t'e k i t t y", baplistVar2)).toEqual(true); // preceding apostrophe (drawback)
  expect(doesContainBadWords("c u t e'k i t t y", baplistVar2)).toEqual(false);
  expect(doesContainBadWords("cute'k i t t y", baplistVar2)).toEqual(true); // preceding apostrophe
  expect(doesContainBadWords("c'u't'e'k'i't't'y", baplistVar2)).toEqual(true); // preceding apostrophe (drawback)
});

test('alternate apostrophe handling on both sides', () => {
  expect(doesContainBadWords("it's k i t t y", baplistVar3)).toEqual(false); // reading as skitty
  expect(doesContainBadWords("a cutes't k i t t y", baplistVar3)).toEqual(false); // reading as tkitty
  expect(doesContainBadWords("so i'd k i t t y", baplistVar3)).toEqual(false); // i'd should count as id
  expect(doesContainBadWords("k i t t y's", baplistVar3)).toEqual(false); // reading it as kittys
  expect(doesContainBadWords("k i t t y'ed", baplistVar3)).toEqual(true); // not ending in a single letter
  expect(doesContainBadWords("k i t t y'cute", baplistVar3)).toEqual(true); // not ending in a single letter
  expect(doesContainBadWords("k i t t y'c u t e", baplistVar3)).toEqual(false); // reading it as kittycute
  expect(doesContainBadWords("k'i't't'y'c'u't'e", baplistVar3)).toEqual(false); // reading it as kittycute
  expect(doesContainBadWords("c u t'e k i t t y", baplistVar3)).toEqual(false); // reading it as cutekitty
  expect(doesContainBadWords("c u t e'k i t t y", baplistVar3)).toEqual(false); // reading it as cutekitty
  expect(doesContainBadWords("cute'k i t t y", baplistVar3)).toEqual(true); // not starting in a single letter
  expect(doesContainBadWords("c'u't'e'k'i't't'y", baplistVar3)).toEqual(false); // reading it as cutekitty
});

test('single ending* wildcard', () => {
  expect(doesContainBadWords('hell', baplist)).toEqual(true);
  expect(doesContainBadWords('hellhole', baplist)).toEqual(true);
  expect(doesContainBadWords('hellish', baplist)).toEqual(true);
  expect(doesContainBadWords('hell-hole', baplist)).toEqual(true);
  expect(doesContainBadWords('hell-ish', baplist)).toEqual(true);
  expect(doesContainBadWords('hell hole', baplist)).toEqual(true);

  expect(doesContainBadWords('shell', baplist)).toEqual(false);
  expect(doesContainBadWords('shell', baplist)).toEqual(false);
  expect(doesContainBadWords('shellshocked', baplist)).toEqual(false);

  expect(doesContainBadWords('h e l l', baplist)).toEqual(true);
  expect(doesContainBadWords('s h e l l', baplist)).toEqual(false);
  expect(doesContainBadWords("it's h e l l", baplist)).toEqual(true);
  expect(doesContainBadWords('h\ne\nl\nl', baplist)).toEqual(true);
  expect(doesContainBadWords('s\nh\ne\nl\nl', baplist)).toEqual(false);
  expect(doesContainBadWords('h e l l f i s h', baplist)).toEqual(true);
  expect(doesContainBadWords('s h e l l f i s h', baplist)).toEqual(false);

  expect(doesContainBadWords('hello', baplist)).toEqual(false);
  expect(doesContainBadWords('hellosies', baplist)).toEqual(false);
  expect(doesContainBadWords('shello', baplist)).toEqual(false);
  expect(doesContainBadWords('hell-o', baplist)).toEqual(true);
  expect(doesContainBadWords('hell-o fish', baplist)).toEqual(true);
  expect(doesContainBadWords('h-e-l-l-o fish', baplist)).toEqual(false);
  expect(doesContainBadWords('h e l l o', baplist)).toEqual(false);
  expect(doesContainBadWords('h-e-l-l o', baplist)).toEqual(true); // distinction with space instead of character
  expect(doesContainBadWords("h-e-l-l'o", baplist)).toEqual(false);
  expect(doesContainBadWords('h-e-l-l    o', baplist)).toEqual(true);
});

test('phrase with whitespace', () => {
  expect(doesContainBadWords('ban ananas', baplist)).toEqual(true);
  expect(doesContainBadWords('banana nas', baplist)).toEqual(false);
  expect(doesContainBadWords('ban ana nas', baplist)).toEqual(false);
  expect(doesContainBadWords('banan anas', baplist)).toEqual(false);
  expect(doesContainBadWords('ban    ananas', baplist)).toEqual(true);
  expect(doesContainBadWords('ban ~- . -^ ananas', baplist)).toEqual(true);
  expect(doesContainBadWords('banananas', baplist)).toEqual(false);
  expect(doesContainBadWords('b-a-n-a-n-a-n-a-s', baplist)).toEqual(true);
  expect(doesContainBadWords('b-a-n a-n-a-n-a-s', baplist)).toEqual(true);
  expect(doesContainBadWords('b-a-n      a-n-a-n-a-s', baplist)).toEqual(true);
  expect(doesContainBadWords('ban ananas juice', baplist)).toEqual(false);
  expect(doesContainBadWords('b.a.n.a.n.a.n.a.s.j.u.i.c.e', baplist)).toEqual(false);
});

test('word with two *wildcards*', () => {
  expect(doesContainBadWords('word', baplist)).toEqual(true);
  expect(doesContainBadWords('wordless', baplist)).toEqual(true);
  expect(doesContainBadWords('stopword', baplist)).toEqual(true);
  expect(doesContainBadWords('stopwords', baplist)).toEqual(true);
  expect(doesContainBadWords('s-t-o-p-w-o-r-d-s', baplist)).toEqual(true);
  expect(doesContainBadWords('s t o p w o r d s', baplist)).toEqual(true);
  expect(doesContainBadWords('keyword', baplist)).toEqual(false); // exact whitelist
  expect(doesContainBadWords('keywords', baplist)).toEqual(true); // whitelist requirement not met
  expect(doesContainBadWords('akeywords', baplist)).toEqual(true); // whitelist requirement not met
  expect(doesContainBadWords('akeyword', baplist)).toEqual(true); // whitelist requirement not met
  expect(doesContainBadWords('loanword', baplist)).toEqual(false);
  expect(doesContainBadWords('loanwords', baplist)).toEqual(false);
  expect(doesContainBadWords('loanwording', baplist)).toEqual(false); // whitelist loanword* and *wording
  expect(doesContainBadWords('loanwordle', baplist)).toEqual(false); // whitelist loanword*
  expect(doesContainBadWords('noloanword', baplist)).toEqual(true); // not whitelisted
  expect(doesContainBadWords('wording', baplist)).toEqual(false);
  expect(doesContainBadWords('rewording', baplist)).toEqual(false);
  expect(doesContainBadWords('rewordings', baplist)).toEqual(true); // not whitelisted "s" at end
  expect(doesContainBadWords('sword', baplist)).toEqual(false); // whitelisted
  expect(doesContainBadWords('swordfish', baplist)).toEqual(false); // whitelisted
  expect(doesContainBadWords('longsword', baplist)).toEqual(false); // whitelisted
  expect(doesContainBadWords('miswordings', baplist)).toEqual(false); // whitelisted *sword*
});

test('filter a link', () => {
  expect(doesContainBadWords('this.is/a_link', baplist)).toEqual(true);
  expect(doesContainBadWords('linkaco/', baplist)).toEqual(false);
  expect(doesContainBadWords('link.co/', baplist)).toEqual(true);
  expect(doesContainBadWords('this.is/a_link_somewhere', baplist)).toEqual(true);
  expect(doesContainBadWords('this.is\\/a_link_somewhere', baplist)).toEqual(false);
  expect(doesContainBadWords('www.this.is/a_link', baplist)).toEqual(true);
  expect(doesContainBadWords('www.this.is/a_linksomewhere', baplist)).toEqual(true);
  expect(doesContainBadWords('this%is/a_li_nk', baplist)).toEqual(false);
  expect(doesContainBadWords('t-h_i_s?.!i@s / a _ l i n k somewhere', baplist)).toEqual(true);
  expect(doesContainBadWords('t h i s . i s / a _ l i n k', baplist)).toEqual(true);
  expect(doesContainBadWords('t-h_i_s?.!i@s / a _ l i n k', baplist)).toEqual(true);
});

test('correctly filter words with special characters', () => {
  expect(doesContainBadWords('a$$hole', baplist)).toEqual(true);
  expect(doesContainBadWords('¯\\_(ツ)_/¯', baplist)).toEqual(true);
  expect(doesContainBadWords('¯_(ツ)_/¯', baplist)).toEqual(false);
  expect(doesContainBadWords('/(?:a)?fake(.)*regex$/', baplist)).toEqual(true);
  expect(doesContainBadWords('/(?: a)?fake(.)*regex$/', baplist)).toEqual(false);
  expect(doesContainBadWords('/ ( ? : a ) ? f a k e ( . ) * r e g e x $ /', baplist)).toEqual(true);
  expect(doesContainBadWords('/ ( ? :   a ) ? f  a --k ~e (...) * r e g e  x $ /', baplist)).toEqual(true);
  expect(doesContainBadWords('fakeregex', baplist)).toEqual(false);
  expect(doesContainBadWords('afakeregex', baplist)).toEqual(false);
  expect(doesContainBadWords('afakexxxregex', baplist)).toEqual(false);
  expect(doesContainBadWords('afakexxxregexa', baplist)).toEqual(false);
});

test('escape strings for regular expression', () => {
  expect(escapeStringForRegex('is it escaped? \\ ^ $ * + ? . ( ) | { } [ ]')).toBe(
    'is it escaped\\? \\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]',
  );
});

test('create regex', () => {
  expect(new RegExp(escapeStringForRegex('¯\\_(ツ)_/¯'))).toStrictEqual(/¯\\_\(ツ\)_\/¯/);
});

test('finding any bad word in the input', () => {
  expect(findAnyBadWord('kitty', baplist)).toEqual('kitty');
  expect(findAnyBadWord('hell', baplist)).toEqual('hell*');
  expect(findAnyBadWord('word', baplist)).toEqual('*word*');
  expect(findAnyBadWord('ban ananas', baplist)).toEqual('ban ananas');
  expect(findAnyBadWord('hello kitty', baplist)).toBeUndefined();
  expect(findAnyBadWord('blabla', baplist)).toBeUndefined();
  expect(['kitty', 'hell*']).toContain(findAnyBadWord('hell kitty', baplist));
  expect(['hell*', 'ban ananas', 'kitty', '*word*']).toContain(
    findAnyBadWord('ban ananas keywords hellfish k&it_ty', baplist),
  );
});

test('finding all bad words in the input', () => {
  expect(findAllBadWords('kitty', baplist)).toEqual(['kitty']);
  expect(findAllBadWords('hell', baplist)).toEqual(['hell*']);
  expect(findAllBadWords('word', baplist)).toEqual(['*word*']);
  expect(findAllBadWords('ban ananas', baplist)).toEqual(['ban ananas']);
  expect(findAllBadWords('hello kitty', baplist)).toEqual([]);
  expect(findAllBadWords('blabla', baplist)).toEqual([]);
  expect(findAllBadWords('blabla', baplist)).toHaveLength(0);
  expect(findAllBadWords('hell kitty', baplist)).toContain('hell*');
  expect(findAllBadWords('hell kitty', baplist)).toContain('kitty');
  expect(findAllBadWords('hell kitty', baplist)).toHaveLength(2);
  expect(findAllBadWords('ban ananas keywords hellfish k&it_ty', baplist)).toContain('kitty');
  expect(findAllBadWords('ban ananas keywords hellfish k&it_ty', baplist)).toContain('hell*');
  expect(findAllBadWords('ban ananas keywords hellfish k&it_ty', baplist)).toContain('ban ananas');
  expect(findAllBadWords('ban ananas keywords hellfish k&it_ty', baplist)).toContain('*word*');
  expect(findAllBadWords('ban ananas keywords hellfish k&it_ty', baplist)).toHaveLength(4);
});

test('override a bad word list', () => {
  expect(doesContainBadWords('kitty', baplist, overrideList1)).toEqual(true);
  expect(doesContainBadWords('hell', baplist, overrideList1)).toEqual(false);
  expect(doesContainBadWords('hello', baplist, overrideList1)).toEqual(false);
  expect(doesContainBadWords('ban ananas juice', baplist, overrideList1)).toEqual(true);
  expect(doesContainBadWords('link.co/', baplist, overrideList1)).toEqual(false);
  expect(doesContainBadWords('magic words', baplist, overrideList1)).toEqual(false);
  expect(doesContainBadWords('words magic words magic words', baplist, overrideList1)).toEqual(true);
  expect(findAllBadWords('hell kitty', baplist, overrideList1)).toHaveLength(1);
  expect(findAllBadWords('hell kitty', baplist, overrideList1)).toContain('kitty');
  expect(findAllBadWords('hell kitty', baplist, overrideList1)).not.toContain('hell*');
  expect(findAllBadWords('words magic words magic words', baplist, overrideList1)).toHaveLength(1);
  expect(findAllBadWords('words magic words magic words words', baplist, overrideList1)).toHaveLength(1);
  expect(findAllBadWords('words magic words magic words words kitty', baplist, overrideList1)).toHaveLength(2);
  expect(findAllBadWords('words magic words magic words words', baplist, overrideList1)).toContain('*word*');
});

const badwords2 = ['bla'];
const goodwords2 = [];
const baplist2 = preprocessWordLists(badwords2, goodwords2);
const overrideList2 = preprocessWordListOverrideData(baplist2, [], [], ['bla']);

test('use override list', () => {
  expect(doesContainBadWords('bla', baplist2, overrideList2)).toEqual(false);
});

test('finding bad words through its locations', () => {
  expect(getBadWords(findBadWordLocations('kitty', baplist))).toEqual(findAllBadWords('kitty', baplist));
  expect(getBadWords(findBadWordLocations('hell', baplist))).toEqual(findAllBadWords('hell', baplist));
  expect(getBadWords(findBadWordLocations('hello kitty', baplist))).toEqual(findAllBadWords('hello kitty', baplist));
  expect(getBadWords(findBadWordLocations('blabla', baplist))).toEqual(findAllBadWords('blabla', baplist));
  expect(getBadWords(findBadWordLocations('hell kitty', baplist))).toEqual(findAllBadWords('hell kitty', baplist));
  expect(getBadWords(findBadWordLocations('ban ananas keywords hellfish k&it_ty', baplist))).toEqual(
    findAllBadWords('ban ananas keywords hellfish k&it_ty', baplist),
  );
});

test('replace bad words with grawlix', () => {
  expect(replaceBadWords('kitty', findBadWordLocations('kitty', baplist))).toEqual(grawlix('kitty'));
  expect(replaceBadWords('hell', findBadWordLocations('hell', baplist))).toEqual(grawlix('hell'));
  expect(replaceBadWords('ban ananas', findBadWordLocations('ban ananas', baplist))).toEqual(grawlix('ban ananas'));
  expect(replaceBadWords('blabla', findBadWordLocations('blabla', baplist))).toEqual('blabla');
  expect(replaceBadWords('cute kitty cat', findBadWordLocations('cute kitty cat', baplist))).toEqual(
    'cute ' + grawlix('kitty') + ' cat',
  );
  expect(
    replaceBadWords(
      'he.l-l what a kit~ty my w o r d',
      findBadWordLocations('he.l-l what a kit~ty my w o r d', baplist),
    ),
  ).toEqual(grawlix('he.l-l') + ' what a ' + grawlix('kit~ty') + ' my ' + grawlix('w o r d'));
  expect(
    replaceBadWords(
      'he.l-l, what a kit~ty my w o r d!',
      findBadWordLocations('he.l-l, what a kit~ty my w o r d!', baplist),
    ),
  ).toEqual(grawlix('he.l-l') + ', what a ' + grawlix('kit~ty') + ' my ' + grawlix('w o r d') + '!');
  expect(
    replaceBadWords(
      'a .-~h*e\\l---l~-. ^°-.k+itt`y.. cat',
      findBadWordLocations('a .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist),
    ), // "hell*" does not get hit because fully spaced out, it's parsed "ahell"
  ).toEqual('a .-~h*e\\l---l~-. ^°-.' + grawlix('k+itt`y') + '.. cat');
  expect(
    replaceBadWords(
      'the .-~h*e\\l---l~-. ^°-.k+itt`y.. cat',
      findBadWordLocations('the .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist),
    ),
  ).toEqual('the .-~' + grawlix('h*e\\l---l') + '~-. ^°-.' + grawlix('k+itt`y') + '.. cat');
});

test('equality of replacement function with the tidier function', () => {
  expect(replaceBadWords('kitty', findBadWordLocations('kitty', baplist))).toEqual(censorText('kitty', baplist));
  expect(replaceBadWords('hell', findBadWordLocations('hell', baplist))).toEqual(censorText('hell', baplist));
  expect(replaceBadWords('ban ananas', findBadWordLocations('ban ananas', baplist))).toEqual(
    censorText('ban ananas', baplist),
  );
  expect(replaceBadWords('blabla', findBadWordLocations('blabla', baplist))).toEqual(censorText('blabla', baplist));
  expect(replaceBadWords('cute kitty cat', findBadWordLocations('cute kitty cat', baplist))).toEqual(
    censorText('cute kitty cat', baplist),
  );
  expect(
    replaceBadWords(
      'he.l-l what a kit~ty my w o r d',
      findBadWordLocations('he.l-l what a kit~ty my w o r d', baplist),
    ),
  ).toEqual(censorText('he.l-l what a kit~ty my w o r d', baplist));
  expect(
    replaceBadWords(
      'he.l-l, what a kit~ty my w o r d!',
      findBadWordLocations('he.l-l, what a kit~ty my w o r d!', baplist),
    ),
  ).toEqual(censorText('he.l-l, what a kit~ty my w o r d!', baplist));
  expect(
    replaceBadWords(
      'a .-~h*e\\l---l~-. ^°-.k+itt`y.. cat',
      findBadWordLocations('a .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist),
    ), // "hell*" does not get hit because fully spaced out, it's parsed "ahell"
  ).toEqual(censorText('a .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist));
  expect(
    replaceBadWords(
      'the .-~h*e\\l---l~-. ^°-.k+itt`y.. cat',
      findBadWordLocations('the .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist),
    ),
  ).toEqual(censorText('the .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist));
});

test('replace bad words with repeat character', () => {
  expect(
    censorText('kitty', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('kitty'.length));
  expect(
    censorText('hell', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('hell'.length));
  expect(
    censorText('ban ananas', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('ban'.length) + ' ' + '-'.repeat('ananas'.length));
  expect(
    censorText('blabla', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('blabla');
  expect(
    censorText('cute kitty cat', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('cute ' + '-'.repeat('kitty'.length) + ' cat');
  expect(
    censorText('he.l-l what a kit~ty my w o r d', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('--.--- what a ---~-- my - - - -');
  expect(
    censorText('he.l-l, what a kit~ty my w o r d!', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('--.---, what a ---~-- my - - - -!');
  expect(
    censorText('a .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }), // "hell*" does not get hit because fully spaced out, it's parsed "ahell"
  ).toEqual('a .-~h*e\\l---l~-. ^°-.-+---`-.. cat');
  expect(
    censorText('the .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('the .-~-*-\\-----~-. ^°-.-+---`-.. cat');
});

test('replace bad words with custom repeat character', () => {
  expect(
    censorText('kitty', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementRepeatCharacter: '#',
    }),
  ).toEqual('#'.repeat('kitty'.length));
  expect(
    censorText('hell', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementRepeatCharacter: '*',
    }),
  ).toEqual('*'.repeat('hell'.length));
  expect(
    censorText('ban ananas', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementRepeatCharacter: 'x',
    }),
  ).toEqual('x'.repeat('ban'.length) + ' ' + 'x'.repeat('ananas'.length));
  expect(
    censorText('blabla', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementRepeatCharacter: '_',
    }),
  ).toEqual('blabla');
  expect(
    censorText('cute kitty cat', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementRepeatCharacter: '_',
    }),
  ).toEqual('cute ' + '_'.repeat('kitty'.length) + ' cat');
  expect(
    censorText('he.l-l what a kit~ty my w o r d', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementRepeatCharacter: '0',
    }),
  ).toEqual('00.0-0 what a 000~00 my 0 0 0 0');
  expect(
    censorText('he.l-l, what a kit~ty my w o r d!', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementRepeatCharacter: ':',
    }),
  ).toEqual('::.:-:, what a :::~:: my : : : :!');
  expect(
    censorText('a .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementRepeatCharacter: '\\',
    }), // "hell*" does not get hit because fully spaced out, it's parsed "ahell"
  ).toEqual('a .-~h*e\\l---l~-. ^°-.\\+\\\\\\`\\.. cat');
  expect(
    censorText('the .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementRepeatCharacter: '\\',
    }),
  ).toEqual('the .-~\\*\\\\\\---\\~-. ^°-.\\+\\\\\\`\\.. cat');
});

test('replace bad words but keep first and/or last characters', () => {
  expect(censorText('kitty', baplist, { replacementMethod: WordReplacementMethod.KeepFirstCharacter })).toEqual(
    'k' + grawlix('itty'),
  );
  expect(censorText('hell', baplist, { replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter })).toEqual(
    'h' + grawlix('el') + 'l',
  );
  expect(censorText('ban ananas', baplist, { replacementMethod: WordReplacementMethod.KeepFirstCharacter })).toEqual(
    'b' + grawlix('an ananas'),
  );
  expect(censorText('blabla', baplist, { replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter })).toEqual(
    'blabla',
  );
  expect(
    censorText('cute kitty cat', baplist, { replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter }),
  ).toEqual('cute k' + grawlix('itt') + 'y cat');
  expect(
    censorText('he.l-l what a kit~ty my w o r d', baplist, {
      replacementMethod: WordReplacementMethod.KeepFirstCharacter,
    }),
  ).toEqual('h' + grawlix('e.l-l') + ' what a k' + grawlix('it~ty') + ' my w' + grawlix(' o r d'));
  expect(
    censorText('he.l-l, what a kit~ty my w o r d!', baplist, {
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('h' + grawlix('e.l-') + 'l, what a k' + grawlix('it~t') + 'y my w' + grawlix(' o r ') + 'd!');
  expect(
    censorText('a .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist, {
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
      replacementType: WordReplacementType.RepeatCharacter,
    }), // "hell*" does not get hit because fully spaced out, it's parsed "ahell"
  ).toEqual('a .-~h*e\\l---l~-. ^°-.k+---`y.. cat');
  expect(
    censorText('the .-~h*e\\l---l~-. ^°-.k+itt`y.. cat', baplist, {
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('the .-~h*-\\----l~-. ^°-.k+---`y.. cat');
});

test('replace bad words regardless of capitalisation', () => {
  expect(
    censorText('KITTY', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('KITTY'.length));
  expect(
    censorText('Kitty', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('Kitty'.length));
  expect(
    censorText('kItTy', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('kItTy'.length));
  expect(
    censorText('hELl', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('hELl'.length));
  expect(
    censorText('bAn Ananas', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('bAn'.length) + ' ' + '-'.repeat('Ananas'.length));
  expect(
    censorText('blABlA', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('blABlA');
  expect(
    censorText('cuTe kITTy CAt', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('cuTe ' + '-'.repeat('kITTy'.length) + ' CAt');
  expect(
    censorText('He.L-l wHAt a kIt~tY mY W o R d', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('--.--- wHAt a ---~-- mY - - - -');

  expect(
    censorText('KITTY', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('K' + '-'.repeat('ITT'.length) + 'Y');
  expect(
    censorText('Kitty', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('K' + '-'.repeat('itt'.length) + 'y');
  expect(
    censorText('kItTy', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('k' + '-'.repeat('ItT'.length) + 'y');
  expect(
    censorText('hElL', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('h' + '-'.repeat('El'.length) + 'L');
  expect(
    censorText('bAn AnanaS', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('b' + '-'.repeat('An'.length) + ' ' + '-'.repeat('Anana'.length) + 'S');
  expect(
    censorText('blABlA', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('blABlA');
  expect(
    censorText('cuTe KiTTy CAt', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('cuTe K' + '-'.repeat('iTT'.length) + 'y CAt');
  expect(
    censorText('He.L-l wHAt a kIt~tY mY W o R d', baplist, {
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('H-.--l wHAt a k--~-Y mY W - - d');
});

test('replace bad words only if capitalisation matches', () => {
  expect(
    censorText('KITTY', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.ExactMatch,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('KITTY');
  expect(
    censorText('Kitty', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.ExactMatch,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('Kitty');
  expect(
    censorText('kItTy', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.ExactMatch,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('kItTy');
  expect(
    censorText('blABlA', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.ExactMatch,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('blABlA');
  expect(
    censorText('cuTe kitty CAt', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.ExactMatch,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('cuTe ' + '-'.repeat('kitty'.length) + ' CAt');
  expect(
    censorText('He.L-l wHAt a kIt~tY mY w o r d', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.ExactMatch,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('He.L-l wHAt a kIt~tY mY - - - -');
});

test('replace bad words after reducing repeat characters', () => {
  expect(
    censorText('kitttttty', baplist, {
      reduceRepeatCharactersTo: 1,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('kitttttty'); // no bad word found if reduced to "kity"
  expect(
    censorText('kitttttty', baplist, {
      reduceRepeatCharactersTo: 2,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('kitty'.length));
  expect(
    censorText('kitttttty', baplist, {
      reduceRepeatCharactersTo: 3,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('kitttttty'); // no bad word found if reduced to "kittty"
  expect(
    censorText('wwwwwwoorrrrrd', baplist, {
      reduceRepeatCharactersTo: 3,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('wwwwwwoorrrrrd'); // no bad word found if reduced to "wwwoorrrd"
  expect(
    censorText('wwwwwwoorrrrrd', baplist, {
      reduceRepeatCharactersTo: 2,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('wwwwwwoorrrrrd'); // no bad word found if reduced to "wwoorrd"
  expect(
    censorText('wwwwwwoorrrrrd', baplist, {
      reduceRepeatCharactersTo: 1,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('word'.length));
});

test('bad input for reducing repeat characters', () => {
  let fnRef = () =>
    censorText('wwwwwwoorrrrrd', baplist, {
      reduceRepeatCharactersTo: 0,
      replacementType: WordReplacementType.RepeatCharacter,
    });
  expect(fnRef).toThrow(Error);
  fnRef = () =>
    censorText('wwwwwwoorrrrrd', baplist, {
      reduceRepeatCharactersTo: -1,
      replacementType: WordReplacementType.RepeatCharacter,
    });
  expect(fnRef).toThrow(Error);
  fnRef = () =>
    censorText('wwwwwwoorrrrrd', baplist, {
      reduceRepeatCharactersTo: 1.1,
      replacementType: WordReplacementType.RepeatCharacter,
    });
  expect(fnRef).toThrow(Error);
  fnRef = () =>
    censorText('wwwwwwoorrrrrd', baplist, {
      reduceRepeatCharactersTo: 4 / 2,
      replacementType: WordReplacementType.RepeatCharacter,
    });
  expect(fnRef).not.toThrow(Error);
  expect(fnRef()).toBe('wwwwwwoorrrrrd');
  fnRef = () =>
    censorText('wwwwwwoorrrrrd', baplist, {
      reduceRepeatCharactersTo: 6 / 2,
      replacementType: WordReplacementType.RepeatCharacter,
    });
  expect(fnRef).not.toThrow(Error);
  expect(fnRef()).toBe('wwwwwwoorrrrrd');
  fnRef = () =>
    censorText('wwwwwwoorrrrrd', baplist, {
      reduceRepeatCharactersTo: 15 / 15,
      replacementType: WordReplacementType.RepeatCharacter,
    });
  expect(fnRef).not.toThrow(Error);
  expect(fnRef()).toBe('-'.repeat('word'.length));
});

test('replace bad words with weird alphabets', () => {
  expect(textToLatin('ᖽᐸ')).toEqual('k');
  expect(
    censorText('ᖽᐸᓰᖶᖶᖻ', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('kitty'.length));
  expect(
    censorText('Ҝเｔ丅ү', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('kitty'.length));
  expect(
    censorText('кเՇՇץ', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('kitty'.length));
  expect(
    censorText('нєℓℓ', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('hell'.length));
  expect(
    censorText('乃ﾑ刀 ﾑ刀ﾑ刀ﾑ丂', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('-'.repeat('ban'.length) + ' ' + '-'.repeat('ananas'.length));
  expect(
    censorText('ᗷᒪᗩᗷᒪᗩ', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('ᗷᒪᗩᗷᒪᗩ');
  expect(
    censorText('çմͲҽ ҟìͲͲվ ↻Ⱥէ', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('cute ' + '-'.repeat('kitty'.length) + ' cat');
  expect(
    censorText('Ħ𝑒.Ⓛ-ㄥ 𝔴ђ𝔸𝓽 α 𝔨ⓘŤ~тƳ 𝕄ｙ 𝓌 𝑜 𝓻 𝐝', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
    }),
  ).toEqual('--.--- what a ---~-- my - - - -');

  expect(
    censorText('ᖽᐸᓰᖶᖶᖻ', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('k' + '-'.repeat('itt'.length) + 'y');
  expect(
    censorText('кเՇՇץ', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('k' + '-'.repeat('itt'.length) + 'y');
  expect(
    censorText('Ҝเｔ丅ү', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('k' + '-'.repeat('itt'.length) + 'y');
  expect(
    censorText('нєℓℓ', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('h' + '-'.repeat('el'.length) + 'l');
  expect(
    censorText('乃ﾑ刀 ﾑ刀ﾑ刀ﾑ丂', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('b' + '-'.repeat('an'.length) + ' ' + '-'.repeat('anana'.length) + 's');
  expect(
    censorText('ᗷᒪᗩᗷᒪᗩ', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('ᗷᒪᗩᗷᒪᗩ');
  expect(
    censorText('çմͲҽ ҟìͲͲվ ↻Ⱥէ', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('cute k' + '-'.repeat('itt'.length) + 'y cat');
  expect(
    censorText('Ħ𝑒.Ⓛ-ㄥ 𝔴ђ𝔸𝓽 α 𝔨ⓘŤ~тƳ 𝕄ｙ 𝓌 𝑜 𝓻 𝐝', baplist, {
      inputPreprocessMethod: InputPreprocessMethod.Thorough,
      replacementType: WordReplacementType.RepeatCharacter,
      replacementMethod: WordReplacementMethod.KeepFirstAndLastCharacter,
    }),
  ).toEqual('h-.--l what a k--~-y my w - - d');
});

test('replace emojis', () => {
  expect(unEmoji('🇬⭕ 🔛')).toBe('go on');
  expect(unEmoji('🅿🇺®️💰🇪')).toBe('purse');
});

test('remove accents', () => {
  expect(removeTextAccents('Z̵̡̭͝ả̶̬̘̈́l̶̜͗g̵̜̲͒́o̶̞̅̊')).toBe('Zalgo');
  expect(removeTextAccents('à-côtés')).toBe('a-cotes');
  expect(removeTextAccents('ᑕⓞ֑ο̤͕𝕃ܑׅ')).toBe('ᑕⓞο𝕃');
});

test('turn things to latin (speed test baseline)', () => {
  expect(textToLatin('')).toBe('');
});

test('turn things to latin (speed test)', () => {
  expect(textToLatin('†hê qµï¢k ßrðwñ £ðx jµmþ§ ðvêr †hê låz¥ Ððg.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
});

test('turn things to latin (sanity test)', () => {
  expect(textToLatin('The quick brown fox jumps over the lazy dog.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
});

test('turn things to latin', () => {
  expect(textToLatin('†hê qµï¢k ßrðwñ £ðx jµmþ§ ðvêr †hê låz¥ Ððg.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
  expect(textToLatin('тнє qυι¢к вяσωη ƒσχ נυмρѕ σνєя тнє ℓαzу ∂σg.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
  expect(textToLatin('ᏖᏂᏋ ᎤᏬᎥፈᏦ ᏰᏒᎧᏇᏁ ᎦᎧጀ ᏠᏬᎷᎮᏕ ᎧᏉᏋᏒ ᏖᏂᏋ ᏝᗩፚᎩ ᎴᎧᎶ.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
  expect(textToLatin('thē ๑นi¢k ๖r໐ຟຖ f໐x วน๓pŞ ໐งēr thē lคຊฯ ໓໐ງ.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
  expect(textToLatin('ⓣｈ乇 q𝐔ｉ¢Ҝ 乃𝐑๏𝔀Ⓝ ғόx 𝕁𝕦ϻᑭ𝐬 σ𝕧𝐞𝐑 тʰ€ Ļⓐž¥ 𝕕𝐨𝓖.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
  expect(textToLatin('𝕿𝖍𝖊 𝖖𝖚𝖎𝖈𝖐 𝖇𝖗𝖔𝖜𝖓 𝖋𝖔𝖝 𝖏𝖚𝖒𝖕𝖘 𝖔𝖛𝖊𝖗 𝖙𝖍𝖊 𝖑𝖆𝖟𝖞 𝖉𝖔𝖌.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );

  expect(textToLatin('T̵̫̖̱̭̝̟̪̺͇̓̎͛̉̅̂͘͜͝h̸̢̢̭͈̱̩͔̣̜́̈́̄̎e̷̛͓̞̠̮̝̩̘̤̅̌̽͊̋̋̍ ̷̜̞̳̳͇͚̺̗̺̌͆͂̎̅͆̇͌̐q̷̤͔̜̽̂͌̇͌̆͌u̷͈̤͍̻̞̿̀̍̀i̷͇͔͉̯͕͌̒̆̄ĉ̴̨̝̗̥̻̠̼̮̊͗̎͗̆͂̾̕k̵̢̬͖̥̘̬̠͖͕̣̓̽̃̈́̆̇̍͂͠ ̴̢̛̲́̋̋b̵̨̻̗̓̉͝r̷̛̛̻̳̠̆̀̋͗̈́o̴̢̧̦̘̹̹̣͎̠̔̓̊̐̌̈́͛͋̑͠w̴͓̝͖̗̽̍̀̈́̋̕n̸̼̰̅̋́͌͑͒̾̐͗̋ ̸̢̢͚̽̄f̸̧͍̤͘͘͜ͅơ̸̭̼̩̠̈́͑͆̉̔́x̴̢̣̘̻̪̘̮̌͗̓̑́̚͝ ̶͉̤̳̭͖̝̻̒̾͊̏̓̉j̶̡̱̭͉͗̽̈̕̕u̶̻̼͔̭̝̹͚̇͆̊m̶̡̖̲̪̞̹͍̟̈̈́͑̏̽̕͘p̷̖͍̒̽͊͠͝s̵̡͈͖̲̰͓̜͕͔̠̊̓̑͗͛̂͛̔̓ ̷̱͛̄͝o̶̞̘̱̱͊̈́́̀̓͑̀̀v̷̜͙̜͓̩̾̓̌̃̉̍̅̕ͅͅe̶̡̪̞̖̗͙̝͉̜͑ṟ̵͔̘̀̂͗̇̅̈͋̔̀ ̴͉̃̽̋t̸͉̄̇̈̅̌̃̎́̒ͅh̶̘̝͔͕̮͓̮̍̋̽̚e̶͓͌̈́͋͛͐͝ͅ ̵̤͈͉͖̥̎̍́l̷̦͕̙͓͒̍͋͠ā̴͎̤̎̂̃̎̂͂͝ẓ̶͓̏̾͝ÿ̸̨̻͍́́̓ ̸̘̈́̐͆̏d̷̡̨̟̣͍̝̲͕́̏̒ơ̷̩̘̘̂̋͋̃́͌͘g̴̟̥͇̗͓͑̽̉̕.̵̲̤̙̟͙̅̋͠')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );

  expect(textToLatin('🆃🅷🅴 🆀🆄🅸🅲🅺 🅱🆁🅾🆆🅽 🅵🅾🆇 🅹🆄🅼🅿🆂 🅾🆅🅴🆁 🆃🅷🅴 🅻🅰🆉🆈 🅳🅾🅶.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
  expect(textToLatin('ₜₕₑ qᵤᵢcₖ bᵣₒwₙ fₒₓ ⱼᵤₘₚₛ ₒᵥₑᵣ ₜₕₑ ₗₐzy dₒg.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
  expect(textToLatin('Ⓣⓗⓔ ⓠⓤⓘⓒⓚ ⓑⓡⓞⓦⓝ ⓕⓞⓧ ⓙⓤⓜⓟⓢ ⓞⓥⓔⓡ ⓣⓗⓔ ⓛⓐⓩⓨ ⓓⓞⓖ.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
  expect(textToLatin('Tԋҽ ϙυιƈƙ Ⴆɾσɯɳ ϝσx ʝυɱρʂ σงҽɾ ƚԋҽ ʅαȥყ ԃσɠ.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
  expect(textToLatin('𝕥𝓗𝔼 Ⓠ𝕦ｉĆＫ β𝓇σ𝕎ⓝ ＦⓞЖ 𝓙υｍ𝐏ｓ 𝓞𝓿𝐄Ř 𝓉Ħ€ 𝓁𝒶𝐙Ƴ ᗪỖق.')).toBe(
    'the quick brown fox jumps over the lazy dog.',
  );
  expect(textToLatin('Ｔｈｅ　ｑｕｉｃｋ　ｂｒｏｗｎ　ｆｏｘ　ｊｕｍｐｓ　ｏｖｅｒ　ｔｈｅ　ｌａｚｙ　ｄｏｇ.')).toBe(
    'the　quick　brown　fox　jumps　over　the　lazy　dog.',
  );

  expect(
    textToLatin(
      '𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟' +
        '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩' +
        '𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫' +
        '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ' +
        'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢ🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉𝓐ℬ𝓒𝓓𝓔ℱ𝓖ℋ𝓘ℐ𝓚ℒℳ𝓝𝓞𝓟𝑄ℛ𝓢𝑇𝓤𝓥𝓦𝓧ႸŹ' +
        '𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃❀𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏Ⓐ𝓑Č𝕕Ｅ𝒻gĦ𝓘𝓙𝐊𝓁ｍⓃⓞＰΩⓡ𝓢ţυ𝓥𝔴𝓧ʸŻⓐ𝐁ᶜᗪ𝑒𝒇قℍĮјҜĻᗰŇ𝔬Ｐｑ𝐑𝓼𝐓ǗᵛฬⓍү𝓩' +
        'abᥴᦔeᠻᧁh꠸꠹ᛕlmnoρqrᦓtuvwxyƺabᥴᦔeᠻᧁh꠸꠹ᛕlmnoρqrᦓtuvwxyƺɑϐcժe⨍ᧁhiյƙᥣmno℘qꭈ꯱tυvwxyzɑϐcժe⨍ᧁhiյƙᥣmno℘qꭈ꯱tυvwxyz' +
        '🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉ₐbcdₑfgₕᵢⱼₖₗₘₙₒₚqᵣₛₜᵤᵥwₓyz' +
        'ₐBCDₑFGₕᵢⱼₖₗₘₙₒₚQᵣₛₜᵤᵥWₓYZᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ' +
        'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยשฬאץչค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยשฬאץչ' +
        'αႦƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂƚυʋɯxყȥABCDEFGHIJKLMNOPQRSTUVWXYZǟɮƈɖɛʄɢɦɨʝӄʟʍռօքզʀֆȶʊʋաӼʏʐǟɮƈɖɛʄɢɦɨʝӄʟʍռօքզʀֆȶʊʋաӼʏʐ' +
        'ᏗᏰፈᎴᏋᎦᎶᏂᎥᏠᏦᏝᎷᏁᎧᎮᎤᏒᏕᏖᏬᏉᏇጀᎩፚᏗᏰፈᎴᏋᎦᎶᏂᎥᏠᏦᏝᎷᏁᎧᎮᎤᏒᏕᏖᏬᏉᏇጀᎩፚąცƈɖɛʄɠɧıʝƙƖɱŋơ℘զཞʂɬų۷ῳҳყʑąცƈɖɛʄɠɧıʝƙƖɱŋơ℘զཞʂɬų۷ῳҳყʑ' +
        'ค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊ𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙' +
        '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡' +
        '𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉' +
        'ΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZαв¢∂єƒgнιנкℓмησρqяѕтυνωχуzαв¢∂єƒgнιנкℓмησρqяѕтυνωχуz' +
        'åß¢Ðê£ghïjklmñðþqr§†µvwx¥zÄßÇÐÈ£GHÌJKLMñÖþQR§†ÚVW×¥Z₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ' +
        '卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙ﾑ乃ᄃり乇ｷムんﾉﾌスﾚﾶ刀のｱゐ尺丂ｲひ√Wﾒﾘ乙' +
        'ﾑ乃ᄃり乇ｷムんﾉﾌスﾚﾶ刀のｱゐ尺丂ｲひ√Wﾒﾘ乙abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ' +
        'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚΛＢＣＤΞＦＧＨＩＪＫＬＭＮ♢ＰＱＲＳＴＵＶＷＸＹＺ' +
        'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺabcdefghijklmnopqrstuvwxyz' +
        'ABCDEFGHIJKLMNOPQRSTUVWXYZąҍçժҽƒցհìʝҟӀʍղօքզɾʂէմѵա×վՀȺβ↻ᎠƐƑƓǶįلҠꝈⱮហටφҨའϚͲԱỼచჯӋɀᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ' +
        'ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭YᘔᗩᗷᑢᕲᘿᖴᘜᕼᓰᒚᖽᐸᒪᘻᘉᓍᕵᕴᖇSᖶᑘᐺᘺ᙭ᖻᗱᗩᗷᑢᕲᘿᖴᘜᕼᓰᒚᖽᐸᒪᘻᘉᓍᕵᕴᖇSᖶᑘᐺᘺ᙭ᖻᗱa̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶̶' +
        'A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶a̴b̴c̴d̴e̴f̴g̴h̴i̴j̴k̴l̴m̴n̴o̴p̴q̴r̴s̴t̴u̴v̴w̴x̴y̴z̴̴A̴B̴C̴D̴E̴F̴G̴H̴I̴J̴K̴L̴M̴N̴O̴P̴Q̴R̴S̴T̴U̴V̴W̴X̴Y̴Z̴a̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z̷̷A̷B̷C̷D̷E̷F̷G̷H̷I̷J̷K̷L̷M̷N̷O̷P̷Q̷R̷S̷T̷U̷V̷W̷X̷Y̷Z̷' +
        'a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲̲A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲',
    ).replace(/[a-zA-Z]/g, ''),
  ).toBe('');
});

test('reducing repeat characters', () => {
  expect(reduceRepeatCharacters('')).toBe('');
  expect(reduceRepeatCharacters('', 1)).toBe('');
  expect(reduceRepeatCharacters('', 2)).toBe('');
  expect(reduceRepeatCharacters('', 3)).toBe('');
  expect(reduceRepeatCharacters('hello', 3)).toBe('hello');
  expect(reduceRepeatCharacters('hello', 2)).toBe('hello');
  expect(reduceRepeatCharacters('hello', 1)).toBe('helo');
  expect(reduceRepeatCharacters('hello')).toBe('hello');
  expect(reduceRepeatCharacters('ttttesttt', 3)).toBe('tttesttt');
  expect(reduceRepeatCharacters('ttttesttt', 2)).toBe('ttestt');
  expect(reduceRepeatCharacters('ttttesttt', 1)).toBe('test');
  expect(reduceRepeatCharacters('ttttesttt')).toBe('ttestt');
});

test('bad input for reducing repeat characters', () => {
  let fnRef = () => reduceRepeatCharacters('hello', 0);
  expect(fnRef).toThrow(Error);
  fnRef = () => reduceRepeatCharacters('hello', -1);
  expect(fnRef).toThrow(Error);
  fnRef = () => reduceRepeatCharacters('hello', 1.1);
  expect(fnRef).toThrow(Error);
  fnRef = () => reduceRepeatCharacters('hello', 1.1);
  expect(fnRef).toThrow(Error);
  fnRef = () => reduceRepeatCharacters('hhhhhelllllloooo', 4 / 2);
  expect(fnRef).not.toThrow(Error);
  expect(fnRef()).toBe('hhelloo');
  fnRef = () => reduceRepeatCharacters('hhhhhelllllloooo', 6 / 2);
  expect(fnRef).not.toThrow(Error);
  expect(fnRef()).toBe('hhhelllooo');
});

test('isValidWhitelist', () => {
  expect(isValidWhitelist('', '')).toBe(true);
  expect(isValidWhitelist('text', '')).toBe(true);
  expect(isValidWhitelist('test', '')).toBe(true);

  expect(isValidWhitelist('', 'text')).toBe(false);
  expect(isValidWhitelist('text', 'text')).toBe(true);

  expect(isValidWhitelist('', 'test')).toBe(false);
  expect(isValidWhitelist('test', 'test')).toBe(true);
  expect(isValidWhitelist('attest', 'test')).toBe(false);
  expect(isValidWhitelist('testing', 'test')).toBe(false);
  expect(isValidWhitelist('attesting', 'test')).toBe(false);
  expect(isValidWhitelist('test this', 'test')).toBe(true);
  expect(isValidWhitelist('this test', 'test')).toBe(true);
  expect(isValidWhitelist('this test this', 'test')).toBe(true);
  expect(isValidWhitelist('text', 'test')).toBe(false);

  // circumventions when not checking for circumventions:
  expect(isValidWhitelist('te\'st', 'test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t-e-s-t', 'test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('te~s^t', 'test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t e s t', 'test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t e s t s', 'test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('a t e s t', 'test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('a t e s t s', 'test', { checkCircumventions: false })).toBe(false);

  // circumventions when checking for circumventions
  expect(isValidWhitelist('te\'st', 'test')).toBe(true);
  expect(isValidWhitelist('t-e-s-t', 'test')).toBe(true);
  expect(isValidWhitelist('te~s^t', 'test')).toBe(true);
  expect(isValidWhitelist('t e s t', 'test')).toBe(true);
  expect(isValidWhitelist('t e s t s a', 'test')).toBe(false);
  expect(isValidWhitelist('k i t t y a', 'test',)).toBe(false);
  expect(isValidWhitelist('a t e s t', 'test')).toBe(false);
  expect(isValidWhitelist('a t e s t s', 'test')).toBe(false);

  expect(isValidWhitelist('te*', 'test')).toBe(false); // these negate the bad word fully,
  expect(isValidWhitelist('tes*', 'test')).toBe(false); // which is not the spirit of a whitelist
  expect(isValidWhitelist('test*', 'test')).toBe(true);
  expect(isValidWhitelist('*test', 'test')).toBe(true);
  expect(isValidWhitelist('*est', 'test')).toBe(false); // same here
  expect(isValidWhitelist('*st', 'test')).toBe(false); // same here
  expect(isValidWhitelist('*test*', 'test')).toBe(true);
  expect(isValidWhitelist('*est*', 'test')).toBe(false); // same here
  expect(isValidWhitelist('*st*', 'test')).toBe(false); // same here

  expect(isValidWhitelist('attes*', 'test')).toBe(false);
  expect(isValidWhitelist('attest*', 'test')).toBe(false);
  expect(isValidWhitelist('*attest', 'test')).toBe(false);
  expect(isValidWhitelist('*attes', 'test')).toBe(false);
  expect(isValidWhitelist('*attest*', 'test')).toBe(false);
  expect(isValidWhitelist('*attes*', 'test')).toBe(false);

  expect(isValidWhitelist('testing*', 'test')).toBe(false);
  expect(isValidWhitelist('esting*', 'test')).toBe(false);
  expect(isValidWhitelist('*testing', 'test')).toBe(false);
  expect(isValidWhitelist('*esting', 'test')).toBe(false);
  expect(isValidWhitelist('*testing*', 'test')).toBe(false);
  expect(isValidWhitelist('*esting*', 'test')).toBe(false);

  expect(isValidWhitelist('test this*', 'test')).toBe(true);
  expect(isValidWhitelist('this test*', 'test')).toBe(true);
  expect(isValidWhitelist('this test this*', 'test')).toBe(true);
  expect(isValidWhitelist('*test this', 'test')).toBe(true);
  expect(isValidWhitelist('*this test', 'test')).toBe(true);
  expect(isValidWhitelist('*this test this', 'test')).toBe(true);
  expect(isValidWhitelist('*test this*', 'test')).toBe(true);
  expect(isValidWhitelist('*this test*', 'test')).toBe(true);
  expect(isValidWhitelist('*this test this*', 'test')).toBe(true);

  expect(isValidWhitelist('text*', 'test')).toBe(false);
  expect(isValidWhitelist('*text', 'test')).toBe(false);
  expect(isValidWhitelist('*text*', 'test')).toBe(false);

  expect(isValidWhitelist('', 'test*')).toBe(false);
  expect(isValidWhitelist('test', 'test*')).toBe(true);
  expect(isValidWhitelist('attest', 'test*')).toBe(false);
  expect(isValidWhitelist('testing', 'test*')).toBe(true);
  expect(isValidWhitelist('attesting', 'test*')).toBe(false);
  expect(isValidWhitelist('test this', 'test*')).toBe(true);
  expect(isValidWhitelist('this test', 'test*')).toBe(true);
  expect(isValidWhitelist('this test this', 'test*')).toBe(true);
  expect(isValidWhitelist('text', 'test*')).toBe(false);
  
  // circumventions when not checking for circumventions:
  expect(isValidWhitelist('te\'st', 'test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t-e-s-t', 'test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('te~s^t', 'test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t e s t', 'test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t e s t s', 'test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('a t e s t', 'test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('a t e s t s', 'test*', { checkCircumventions: false })).toBe(false);

  // circumventions when checking for circumventions
  expect(isValidWhitelist('te\'st', 'test*')).toBe(true);
  expect(isValidWhitelist('t-e-s-t', 'test*')).toBe(true);
  expect(isValidWhitelist('te~s^t', 'test*')).toBe(true);
  expect(isValidWhitelist('t e s t', 'test*')).toBe(true);
  expect(isValidWhitelist('t e s t s', 'test*')).toBe(true);
  expect(isValidWhitelist('a t e s t', 'test*')).toBe(false);
  expect(isValidWhitelist('a t e s t s', 'test*')).toBe(false);

  expect(isValidWhitelist('attes*', 'test*')).toBe(false);
  expect(isValidWhitelist('attest*', 'test*')).toBe(false);
  expect(isValidWhitelist('*attest', 'test*')).toBe(false);
  expect(isValidWhitelist('*attes', 'test*')).toBe(false);
  expect(isValidWhitelist('*attest*', 'test*')).toBe(false);
  expect(isValidWhitelist('*attes*', 'test*')).toBe(false);

  expect(isValidWhitelist('testing*', 'test*')).toBe(true);
  expect(isValidWhitelist('esting*', 'test*')).toBe(false);
  expect(isValidWhitelist('*testing', 'test*')).toBe(true);
  expect(isValidWhitelist('*esting', 'test*')).toBe(false);
  expect(isValidWhitelist('*testing*', 'test*')).toBe(true);
  expect(isValidWhitelist('*esting*', 'test*')).toBe(false);

  expect(isValidWhitelist('test this*', 'test*')).toBe(true);
  expect(isValidWhitelist('this test*', 'test*')).toBe(true);
  expect(isValidWhitelist('this test this*', 'test*')).toBe(true);
  expect(isValidWhitelist('*test this', 'test*')).toBe(true);
  expect(isValidWhitelist('*this test', 'test*')).toBe(true);
  expect(isValidWhitelist('*this test this', 'test*')).toBe(true);
  expect(isValidWhitelist('*test this*', 'test*')).toBe(true);
  expect(isValidWhitelist('*this test*', 'test*')).toBe(true);
  expect(isValidWhitelist('*this test this*', 'test*')).toBe(true);
  
  expect(isValidWhitelist('text*', 'test*')).toBe(false);
  expect(isValidWhitelist('*text', 'test*')).toBe(false);
  expect(isValidWhitelist('*text*', 'test*')).toBe(false);

  expect(isValidWhitelist('', '*test')).toBe(false);
  expect(isValidWhitelist('test', '*test')).toBe(true);
  expect(isValidWhitelist('attest', '*test')).toBe(true);
  expect(isValidWhitelist('testing', '*test')).toBe(false);
  expect(isValidWhitelist('attesting', '*test')).toBe(false);
  expect(isValidWhitelist('test this', '*test')).toBe(true);
  expect(isValidWhitelist('this test', '*test')).toBe(true);
  expect(isValidWhitelist('this test this', '*test')).toBe(true);
  expect(isValidWhitelist('text', '*test')).toBe(false);

  // circumventions when not checking for circumventions:
  expect(isValidWhitelist('te\'st', '*test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t-e-s-t', '*test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('te~s^t', '*test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t e s t', '*test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t e s t s', '*test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('a t e s t', '*test', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('a t e s t s', '*test', { checkCircumventions: false })).toBe(false);

  // circumventions when checking for circumventions
  expect(isValidWhitelist('te\'st', '*test')).toBe(true);
  expect(isValidWhitelist('t-e-s-t', '*test')).toBe(true);
  expect(isValidWhitelist('te~s^t', '*test')).toBe(true);
  expect(isValidWhitelist('t e s t', '*test')).toBe(true);
  expect(isValidWhitelist('t e s t s', '*test')).toBe(false);
  expect(isValidWhitelist('a t e s t', '*test')).toBe(true);
  expect(isValidWhitelist('a t e s t s', '*test')).toBe(false);

  expect(isValidWhitelist('attes*', '*test')).toBe(false);
  expect(isValidWhitelist('attest*', '*test')).toBe(true);
  expect(isValidWhitelist('*attest', '*test')).toBe(true);
  expect(isValidWhitelist('*attes', '*test')).toBe(false);
  expect(isValidWhitelist('*attest*', '*test')).toBe(true);
  expect(isValidWhitelist('*attes*', '*test')).toBe(false);

  expect(isValidWhitelist('testing*', '*test')).toBe(false);
  expect(isValidWhitelist('esting*', '*test')).toBe(false);
  expect(isValidWhitelist('*testing', '*test')).toBe(false);
  expect(isValidWhitelist('*esting', '*test')).toBe(false);
  expect(isValidWhitelist('*testing*', '*test')).toBe(false);
  expect(isValidWhitelist('*esting*', '*test')).toBe(false);

  expect(isValidWhitelist('test this*', '*test')).toBe(true);
  expect(isValidWhitelist('this test*', '*test')).toBe(true);
  expect(isValidWhitelist('this test this*', '*test')).toBe(true);
  expect(isValidWhitelist('*test this', '*test')).toBe(true);
  expect(isValidWhitelist('*this test', '*test')).toBe(true);
  expect(isValidWhitelist('*this test this', '*test')).toBe(true);
  expect(isValidWhitelist('*test this*', '*test')).toBe(true);
  expect(isValidWhitelist('*this test*', '*test')).toBe(true);
  expect(isValidWhitelist('*this test this*', '*test')).toBe(true);
  
  expect(isValidWhitelist('text*', '*test')).toBe(false);
  expect(isValidWhitelist('*text', '*test')).toBe(false);
  expect(isValidWhitelist('*text*', '*test')).toBe(false);

  expect(isValidWhitelist('', '*test*')).toBe(false);
  expect(isValidWhitelist('test', '*test*')).toBe(true);
  expect(isValidWhitelist('attest', '*test*')).toBe(true);
  expect(isValidWhitelist('testing', '*test*')).toBe(true);
  expect(isValidWhitelist('attesting', '*test*')).toBe(true);
  expect(isValidWhitelist('test this', '*test*')).toBe(true);
  expect(isValidWhitelist('this test', '*test*')).toBe(true);
  expect(isValidWhitelist('this test this', '*test*')).toBe(true);
  expect(isValidWhitelist('text', '*test*')).toBe(false);

  // circumventions when not checking for circumventions:
  expect(isValidWhitelist('te\'st', '*test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t-e-s-t', '*test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('te~s^t', '*test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t e s t', '*test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('t e s t s', '*test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('a t e s t', '*test*', { checkCircumventions: false })).toBe(false);
  expect(isValidWhitelist('a t e s t s', '*test*', { checkCircumventions: false })).toBe(false);

  // circumventions when checking for circumventions
  expect(isValidWhitelist('te\'st', '*test*')).toBe(true);
  expect(isValidWhitelist('t-e-s-t', '*test*')).toBe(true);
  expect(isValidWhitelist('te~s^t', '*test*')).toBe(true);
  expect(isValidWhitelist('t e s t', '*test*')).toBe(true);
  expect(isValidWhitelist('t e s t s', '*test*')).toBe(true);
  expect(isValidWhitelist('a t e s t', '*test*')).toBe(true);
  expect(isValidWhitelist('a t e s t s', '*test*')).toBe(true);

  expect(isValidWhitelist('attes*', '*test*')).toBe(false);
  expect(isValidWhitelist('attest*', '*test*')).toBe(true);
  expect(isValidWhitelist('*attest', '*test*')).toBe(true);
  expect(isValidWhitelist('*attes', '*test*')).toBe(false);
  expect(isValidWhitelist('*attest*', '*test*')).toBe(true);
  expect(isValidWhitelist('*attes*', '*test*')).toBe(false);

  expect(isValidWhitelist('testing*', '*test*')).toBe(true);
  expect(isValidWhitelist('esting*', '*test*')).toBe(false);
  expect(isValidWhitelist('*testing', '*test*')).toBe(true);
  expect(isValidWhitelist('*esting', '*test*')).toBe(false);
  expect(isValidWhitelist('*testing*', '*test*')).toBe(true);
  expect(isValidWhitelist('*esting*', '*test*')).toBe(false);

  expect(isValidWhitelist('test this*', '*test*')).toBe(true);
  expect(isValidWhitelist('this test*', '*test*')).toBe(true);
  expect(isValidWhitelist('this test this*', '*test*')).toBe(true);
  expect(isValidWhitelist('*test this', '*test*')).toBe(true);
  expect(isValidWhitelist('*this test', '*test*')).toBe(true);
  expect(isValidWhitelist('*this test this', '*test*')).toBe(true);
  expect(isValidWhitelist('*test this*', '*test*')).toBe(true);
  expect(isValidWhitelist('*this test*', '*test*')).toBe(true);
  expect(isValidWhitelist('*this test this*', '*test*')).toBe(true);

  expect(isValidWhitelist('text*', '*test*')).toBe(false);
  expect(isValidWhitelist('*text', '*test*')).toBe(false);
  expect(isValidWhitelist('*text*', '*test*')).toBe(false);
});
