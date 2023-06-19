import { preprocessWordLists, doesContainBadWords } from "../src";

const badwords = ["kitty", "hell*", "*word*", "ban ananas"]
const goodwords = ["hello kitty", "hello*", "ban ananas juice", "keyword", "loanword*", "*sword*", "*wording"]
const baplist = preprocessWordLists(badwords, goodwords);

const baplistVar1 = preprocessWordLists(badwords, goodwords, false, true);
const baplistVar2 = preprocessWordLists(badwords, goodwords, true, false);
const baplistVar3 = preprocessWordLists(badwords, goodwords, false, false);

test("filter standalone bad word", () => {
  expect(doesContainBadWords("kitty", baplist)).toEqual(true);
  expect(doesContainBadWords("-kitty", baplist)).toEqual(true);
  expect(doesContainBadWords("kitty-", baplist)).toEqual(true);
  expect(doesContainBadWords("-kitty-", baplist)).toEqual(true);
  expect(doesContainBadWords(".kitty", baplist)).toEqual(true);
  expect(doesContainBadWords("kitty.", baplist)).toEqual(true);
  expect(doesContainBadWords(".kitty.", baplist)).toEqual(true);
  expect(doesContainBadWords("||kitty||", baplist)).toEqual(true);
  expect(doesContainBadWords("kitty cat", baplist)).toEqual(true);
  expect(doesContainBadWords("kitty-cat", baplist)).toEqual(true);
  expect(doesContainBadWords("kitty!cat", baplist)).toEqual(true);
  expect(doesContainBadWords("kitty^cat", baplist)).toEqual(true);
  expect(doesContainBadWords("kitty/cat", baplist)).toEqual(true);
  expect(doesContainBadWords("cute kitty", baplist)).toEqual(true);
  expect(doesContainBadWords("cute-kitty", baplist)).toEqual(true);
  expect(doesContainBadWords("cute&kitty", baplist)).toEqual(true);
  expect(doesContainBadWords("cute%kitty", baplist)).toEqual(true);
  expect(doesContainBadWords("cute'kitty", baplist)).toEqual(true);
  expect(doesContainBadWords("cute+kitty-cat", baplist)).toEqual(true);
  expect(doesContainBadWords("cute kitty cat", baplist)).toEqual(true);
  expect(doesContainBadWords("kitty kitty kitty", baplist)).toEqual(true);
});

test("only bap standalone word if without wildcards", () => {
  expect(doesContainBadWords("kittycat", baplist)).toEqual(false);
  expect(doesContainBadWords("cutekitty", baplist)).toEqual(false);
  expect(doesContainBadWords("cutekittycat", baplist)).toEqual(false);
  expect(doesContainBadWords("akitty", baplist)).toEqual(false);
  expect(doesContainBadWords("kittys", baplist)).toEqual(false);
  expect(doesContainBadWords("hellokitty", baplist)).toEqual(false);
});

test("spaces between some but not all characters don't bap", () => {
  expect(doesContainBadWords("k itty", baplist)).toEqual(false);
  expect(doesContainBadWords("ki tty", baplist)).toEqual(false);
  expect(doesContainBadWords("kit ty", baplist)).toEqual(false);
  expect(doesContainBadWords("kitt y", baplist)).toEqual(false);
  expect(doesContainBadWords("k it ty", baplist)).toEqual(false);
});

test("whitelisted phrase 'hello kitty'", () => {
  expect(doesContainBadWords("hello kitty", baplist)).toEqual(false);
  expect(doesContainBadWords("kitty hello kitty hello", baplist)).toEqual(true); // not all whitelisted
  expect(doesContainBadWords("hello kitty hello kitty", baplist)).toEqual(false);
  expect(doesContainBadWords("hello-kitty", baplist)).toEqual(false);
  expect(doesContainBadWords("hello-kitty", baplist)).toEqual(false);
  expect(doesContainBadWords("hello-kitty", baplist)).toEqual(false);
  expect(doesContainBadWords("hello   kitty", baplist)).toEqual(false);
  expect(doesContainBadWords("hello \n kitty", baplist)).toEqual(false);
  expect(doesContainBadWords("hello\nkitty", baplist)).toEqual(false);
  expect(doesContainBadWords("hello'kitty", baplist)).toEqual(false);
  expect(doesContainBadWords("hello'kitty", baplist)).toEqual(false);
});

test("spaced out characters get bapped", () => {
  expect(doesContainBadWords("k i t t y", baplist)).toEqual(true);
  expect(doesContainBadWords("k   i  t t  y", baplist)).toEqual(true);
  expect(doesContainBadWords("k-i-t-t-y", baplist)).toEqual(true);
  expect(doesContainBadWords("k.i-t't%y", baplist)).toEqual(true);
  expect(doesContainBadWords("k..i t/t<y", baplist)).toEqual(true);
  expect(doesContainBadWords("le      k i  t  t  y", baplist)).toEqual(true);
});

test("spaced out character don't work if another spaced character follows", () => {
  expect(doesContainBadWords("k i t t y c u t e", baplist)).toEqual(false);
  expect(doesContainBadWords("c u t e k i t t y", baplist)).toEqual(false);
  expect(doesContainBadWords("a k i t t y", baplist)).toEqual(false);
  expect(doesContainBadWords("l e      k i  t  t  y", baplist)).toEqual(false);
  expect(doesContainBadWords("k i t t y s", baplist)).toEqual(false);
});

test("apostrophe handling", () => {
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

test("alternate preceding apostrophe handling", () => {
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

test("alternate followup apostrophe handling", () => {
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

test("alternate apostrophe handling on both sides", () => {
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

test("single ending* wildcard", () => {
  expect(doesContainBadWords("hell", baplist)).toEqual(true);
  expect(doesContainBadWords("hellhole", baplist)).toEqual(true);
  expect(doesContainBadWords("hellish", baplist)).toEqual(true);
  expect(doesContainBadWords("hell-hole", baplist)).toEqual(true);
  expect(doesContainBadWords("hell-ish", baplist)).toEqual(true);
  expect(doesContainBadWords("hell hole", baplist)).toEqual(true);

  expect(doesContainBadWords("shell", baplist)).toEqual(false);
  expect(doesContainBadWords("shell", baplist)).toEqual(false);
  expect(doesContainBadWords("shellshocked", baplist)).toEqual(false);

  expect(doesContainBadWords("h e l l", baplist)).toEqual(true);
  expect(doesContainBadWords("s h e l l", baplist)).toEqual(false);
  expect(doesContainBadWords("it's h e l l", baplist)).toEqual(true);
  expect(doesContainBadWords("h\ne\nl\nl", baplist)).toEqual(true);
  expect(doesContainBadWords("s\nh\ne\nl\nl", baplist)).toEqual(false);
  expect(doesContainBadWords("h e l l f i s h", baplist)).toEqual(true);
  expect(doesContainBadWords("s h e l l f i s h", baplist)).toEqual(false);

  expect(doesContainBadWords("hello", baplist)).toEqual(false);
  expect(doesContainBadWords("hellosies", baplist)).toEqual(false);
  expect(doesContainBadWords("shello", baplist)).toEqual(false);
  expect(doesContainBadWords("hell-o", baplist)).toEqual(true);
  expect(doesContainBadWords("hell-o fish", baplist)).toEqual(true);
  expect(doesContainBadWords("h-e-l-l-o fish", baplist)).toEqual(false);
  expect(doesContainBadWords("h e l l o", baplist)).toEqual(false);
  expect(doesContainBadWords("h-e-l-l o", baplist)).toEqual(true); // distinction with space instead of character
  expect(doesContainBadWords("h-e-l-l'o", baplist)).toEqual(false);
  expect(doesContainBadWords("h-e-l-l    o", baplist)).toEqual(true);
});

test("phrase with whitespace", () => {
  expect(doesContainBadWords("ban ananas", baplist)).toEqual(true);
  expect(doesContainBadWords("banana nas", baplist)).toEqual(false);
  expect(doesContainBadWords("ban ana nas", baplist)).toEqual(false);
  expect(doesContainBadWords("banan anas", baplist)).toEqual(false);
  expect(doesContainBadWords("ban    ananas", baplist)).toEqual(true);
  expect(doesContainBadWords("ban ~- . -^ ananas", baplist)).toEqual(true);
  expect(doesContainBadWords("banananas", baplist)).toEqual(false);
  expect(doesContainBadWords("b-a-n-a-n-a-n-a-s", baplist)).toEqual(true);
  expect(doesContainBadWords("b-a-n a-n-a-n-a-s", baplist)).toEqual(true);
  expect(doesContainBadWords("b-a-n      a-n-a-n-a-s", baplist)).toEqual(true);
  expect(doesContainBadWords("ban ananas juice", baplist)).toEqual(false);
  expect(doesContainBadWords("b.a.n.a.n.a.n.a.s.j.u.i.c.e", baplist)).toEqual(false);
});

test("word with two *wildcards*", () => {
  expect(doesContainBadWords("word", baplist)).toEqual(true);
  expect(doesContainBadWords("wordless", baplist)).toEqual(true);
  expect(doesContainBadWords("stopword", baplist)).toEqual(true);
  expect(doesContainBadWords("stopwords", baplist)).toEqual(true);
  expect(doesContainBadWords("s-t-o-p-w-o-r-d-s", baplist)).toEqual(true);
  expect(doesContainBadWords("s t o p w o r d s", baplist)).toEqual(true);
  expect(doesContainBadWords("keyword", baplist)).toEqual(false); // exact whitelist
  expect(doesContainBadWords("keywords", baplist)).toEqual(true); // whitelist requirement not met
  expect(doesContainBadWords("akeywords", baplist)).toEqual(true); // whitelist requirement not met
  expect(doesContainBadWords("akeyword", baplist)).toEqual(true); // whitelist requirement not met
  expect(doesContainBadWords("loanword", baplist)).toEqual(false);
  expect(doesContainBadWords("loanwords", baplist)).toEqual(false);
  expect(doesContainBadWords("loanwording", baplist)).toEqual(false); // whitelist loanword* and *wording
  expect(doesContainBadWords("loanwordle", baplist)).toEqual(false); // whitelist loanword*
  expect(doesContainBadWords("noloanword", baplist)).toEqual(true); // not whitelisted
  expect(doesContainBadWords("wording", baplist)).toEqual(false);
  expect(doesContainBadWords("rewording", baplist)).toEqual(false);
  expect(doesContainBadWords("rewordings", baplist)).toEqual(true); // not whitelisted "s" at end
  expect(doesContainBadWords("sword", baplist)).toEqual(false); // whitelisted
  expect(doesContainBadWords("swordfish", baplist)).toEqual(false); // whitelisted
  expect(doesContainBadWords("longsword", baplist)).toEqual(false); // whitelisted
  expect(doesContainBadWords("miswordings", baplist)).toEqual(false); // whitelisted *sword*
});
