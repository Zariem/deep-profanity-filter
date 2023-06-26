import { preprocessWordLists, doesContainBadWords, unEmoji, removeTextAccents, textToLatin } from '../src';
import { escapeStringForRegex } from '../src/regex_handler';

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
];
const goodwords = ['hello kitty', 'hello*', 'ban ananas juice', 'keyword', 'loanword*', '*sword*', '*wording'];
const baplist = preprocessWordLists(badwords, goodwords);

console.log(baplist);

const baplistExact = preprocessWordLists(badwords, goodwords, { checkCircumventions: false });

const baplistVar1 = preprocessWordLists(badwords, goodwords, { considerPrecedingApostrophes: false });
const baplistVar2 = preprocessWordLists(badwords, goodwords, { considerFollowUpApostrophes: false });
const baplistVar3 = preprocessWordLists(badwords, goodwords, {
  considerPrecedingApostrophes: false,
  considerFollowUpApostrophes: false,
});

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
});

test("spaced out character don't work if another spaced character follows", () => {
  expect(doesContainBadWords('k i t t y c u t e', baplist)).toEqual(false);
  expect(doesContainBadWords('c u t e k i t t y', baplist)).toEqual(false);
  expect(doesContainBadWords('a k i t t y', baplist)).toEqual(false);
  expect(doesContainBadWords('l e      k i  t  t  y', baplist)).toEqual(false);
  expect(doesContainBadWords('k i t t y s', baplist)).toEqual(false);
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
