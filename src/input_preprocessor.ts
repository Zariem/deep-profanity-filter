/**
 * Replaces all emojis in a text that feature a letter with
 * normal latin characters.
 * Example: "🇬⭕ 🔛" turns into "go on" or
 * "🅿🇺®️💰🇪" turns into "purse".
 * Note: This does NOT replace random emojis used to represent
 * or mask letters, such as '🌸' representing an 'O'.
 *
 * Suggested usage: `textToLatin(unEmoji(inputText))`
 * @param {string} inputText - The text from which you would like to remove all text based emojis.
 * @returns the input text, with all letter based emojis transformed to become text.
 */
export function unEmoji(inputText: string): string {
  return inputText
    .replace(/🆔/g, 'id')
    .replace(/🆚/g, 'vs')
    .replace(/🔤/g, 'abc')
    .replace(/🆎/g, 'ab')
    .replace(/🆑/g, 'cl')
    .replace(/🆘/g, 'sos')
    .replace(/🚾/g, 'wc')
    .replace(/🆖/g, 'ng')
    .replace(/🆗/g, 'ok')
    .replace(/🆙/g, 'up')
    .replace(/🆒/g, 'cool')
    .replace(/🆕/g, 'new')
    .replace(/🔟/g, '10')
    .replace(/🆓/g, 'free')
    .replace(/🔚/g, 'end')
    .replace(/🔙/g, 'back')
    .replace(/🔛/g, 'on')
    .replace(/🔝/g, 'top')
    .replace(/🔜/g, 'soon')
    .replace(/🇦|🅰/g, 'a')
    .replace(/🇧|🅱/g, 'b')
    .replace(/🇨|©️/g, 'c')
    .replace(/🇩/g, 'd')
    .replace(/🇪/g, 'e')
    .replace(/🇫/g, 'f')
    .replace(/🇬/g, 'g')
    .replace(/🇭/g, 'h')
    .replace(/🇮/g, 'i')
    .replace(/🇯/g, 'j')
    .replace(/🇰/g, 'k')
    .replace(/🇱/g, 'l')
    .replace(/🇲/g, 'm')
    .replace(/🇳/g, 'n')
    .replace(/🇴|🅾|⭕/g, 'o')
    .replace(/🇵|🅿/g, 'p')
    .replace(/🇶/g, 'q')
    .replace(/🇷|®️/g, 'r')
    .replace(/🇸|💰/g, 's')
    .replace(/🇹/g, 't')
    .replace(/🇺/g, 'u')
    .replace(/🇻/g, 'v')
    .replace(/🇼/g, 'w')
    .replace(/🇽|❎|❌/g, 'x')
    .replace(/🇾/g, 'y')
    .replace(/🇿/g, 'z');
}

/**
 * Removes most common accents from characters.
 * Example: The text "Z̵̡̭͝ả̶̬̘̈́l̶̜͗g̵̜̲͒́o̶̞̅̊" becomes "Zalgo",
 * the text "à-côtés" becomes "a-cotes",
 * non-latin characters stay non-latin, e.g. "ᑕⓞ֑ο̤͕𝕃ܑׅ" becomes "ᑕⓞο𝕃".
 * @param {string} inputText - The text for which you wish to have all
 * accents removed.
 * @returns the input text, stripped of all accents.
 */
export function removeTextAccents(inputText: string): string {
  return inputText
    .normalize('NFD')
    .replace(/[\u0300-\u036f]|[\u0591-\u05bd]|\u05bf|\u05c1|\u05c2|\u05c4|\u05c5|\u05c7|\u0711|[\u0730-\u074a]/g, '');
}

/**
 * Converts a text of fancy unicode font to latin alphabet characters.
 * This translation happens based on "visual appearance" of the letters,
 * so if you do this to text that is written in a language of non-latin
 * alphabet, you will get weird outputs.
 *
 * Disclaimer: This may at times mistranslate messages, and the list of
 * characters that get converted is most likely not complete, although
 * it is very thoroughly assembled. It will remove most common accents,
 * and returns a latin string in lower case letters. Any characters that
 * could not be mapped to latin characters will still appear in the string.
 *
 * Example:
 * "ᵺⓘ꯱ ₮Ꮛ乂Շ" would turn into "this text" or "Z̵̡̭͝ả̶̬̘̈́l̶̜͗g̵̜̲͒́o̶̞̅̊" turns into "zalgo", or
 * "ᑕⓞ֑ο̤͕𝕃ܑׅ" turns into "cool".
 *
 * Suggested usage: `textToLatin(unEmoji(inputText))`
 * @param {string} inputText - The text which you would like to convert to latin
 * @returns the input text, with foreign or special alphabet letters translated
 * to latin lower case characters
 */
export function textToLatin(inputText: string): string {
  inputText = removeTextAccents(inputText);
  inputText = unEmoji(inputText);
  // replace upper case letters that look different in lower case
  inputText = inputText
    .replace(/Ð/g, 'd')
    .replace(/Σ/g, 'e')
    .replace(/Ⴚ/g, 'g')
    .replace(/Η/g, 'h')
    .replace(/Ꮰ/g, 'j')
    .replace(/Μ/g, 'm')
    .replace(/Ꭴ/g, 'q')
    .replace(/Շ/g, 't')
    .replace(/Ա/g, 'u')
    .replace(/Հ/g, 'z');
  // convert to lower case and replace the rest
  inputText = inputText.toLowerCase();
  return inputText
    .replace(/ᴀ|ₐ|ᴬ|ᵃ|α|ⱥ|ɐ|ᶏ|ẚ|𝐚|𝐀|𝑎|𝐴|𝑨|𝒂|𝖺|𝖠|ⓐ|𝔞|𝔄|𝖆|𝕬|𝓪|𝓐|𝒶|𝒜|𝕒|𝔸|ａ|🄰|ɑ|ค|𝗮|𝗔|𝘢|𝘈|𝙖|𝘼|𝚊|𝙰|λ|₳|卂|ﾑ|ᗩ/g, 'a')
    .replace(/ᴁ|æ|ᴂ/g, 'ae')
    .replace(/ꜵ/g, 'ao')
    .replace(/ꜷ/g, 'au')
    .replace(/ꜹ/g, 'av')
    .replace(/ꜻ|ꜳ/g, 'aa')
    .replace(/ꜽ/g, 'ay')
    .replace(
      /ʙ|ᴃ|в|ᵦ|ᴮ|ᵇ|ɓ|ƀ|ƃ|ᵬ|ᶀ|𝐛|𝐁|𝒃|𝑩|𝖻|𝖡|ⓑ|𝔟|𝔅|𝖇|𝕭|𝓫|𝓑|𝒷|𝑏|𝐵|𝕓|𝔹|ｂ|🄱|ℬ|ϐ|๒|ⴆ|ɮ|ᏸ|ც|๖|𝗯|𝗕|𝘣|𝘉|𝙗|𝘽|𝚋|𝙱|ß|฿|乃|ҍ|β|ᗷ/g,
      'b',
    )
    .replace(
      /ᴄ|ᶜ|¢|ƈ|ȼ|ꞇ|𝒸|ɕ|ᶗ|ɔ|ↄ|ᴐ|𝐜|𝐂|𝑐|𝐶|𝒄|𝑪|𝖼|𝖢|ⓒ|𝔠|ℭ|𝖈|𝕮|𝓬|𝓒|𝒞|𝕔|ℂ|ｃ|🄲|ᥴ|🅲|ς|ፈ|𝗰|𝗖|𝘤|𝘊|𝙘|𝘾|𝚌|𝙲|ᄃ|₵|匚|↻|ᑕ|ᑢ|℃/g,
      'c',
    )
    .replace(
      /ᴅ|ᴰ|ᵈ|∂|ꝺ|ɗ|đ|ƌ|𝒹|ȡ|ᶑ|ᵭ|ᶁ|ɖ|𝐝|𝐃|𝒅|𝑫|𝖽|𝖣|𝑑|𝐷|ⓓ|𝔡|𝔇|𝖉|𝕯|𝓭|𝓓|𝒟|𝕕|𝔻|ｄ|🄳|ᗪ|ᦔ|ժ|🅳|๔|ԃ|ꮄ|໓|𝗱|𝗗|𝘥|𝘋|𝙙|𝘿|𝚍|𝙳|り|ꭰ|ᕲ/g,
      'd',
    )
    .replace(/ǳ|ǆ/g, 'dz')
    .replace(
      /ᴇ|ₑ|ᴱ|ᵉ|ⱻ|ɛ|є|ɇ|ɵ|ꜿ|ǝ|ⱸ|ᶒ|ᶓ|ɘ|𝐞|𝐄|𝒆|𝑬|𝖾|𝖤|ⓔ|𝔢|𝔈|𝖊|𝕰|𝓮|𝓔|𝑒|𝐸|𝕖|𝔼|ｅ|🄴|🅴|ҽ|ꮛ|𝗲|𝗘|𝘦|𝘌|𝙚|𝙀|𝚎|𝙴|乇|ξ|ᘿ|€|ᗴ/g,
      'e',
    )
    .replace(
      /ꜰ|ᶠ|ƒ|ʄ|ꝭ|𝒻|ꝼ|ᵮ|ᶂ|ẜ|ẝ|ғ|ᵳ|𝐟|𝐅|𝒇|𝑭|𝖿|𝖥|ꟻ|ⓕ|𝔣|𝔉|𝖋|𝕱|𝓯|𝓕|𝑓|𝐹|𝕗|𝔽|ｆ|🄵|ℱ|𝒇|ᠻ|⨍|🅵|ϝ|𝗳|𝗙|𝘧|𝘍|𝙛|𝙁|𝚏|𝙵|£|₣|ꭶ|千|ｷ|ᖴ/g,
      'f',
    )
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .replace(/ﬀ/g, 'ff')
    .replace(/ﬃ/g, 'ffi')
    .replace(/ﬄ/g, 'ffl')
    .replace(/ɢ|ʛ|ᴳ|ᵍ|ɠ|ǥ|ᶃ|ɡ|ᵷ|𝓰|𝐠|𝐆|𝐺|𝒈|𝑮|𝗀|𝖦|ⓖ|𝔤|𝔊|𝖌|𝕲|𝓖|𝑔|𝒢|𝕘|𝔾|ｇ|🄶|ق|ᧁ|🅶|ﻮ|ꮆ|ງ|𝗴|𝗚|𝘨|𝘎|𝙜|𝙂|𝚐|𝙶|₲|ム|ց|ᘜ/g, 'g')
    .replace(/ʜ|н|ₕ|ᴴ|ʰ|ⱨ|ħ|ɦ|ɥ|ʮ|ʯ|𝐡|𝐇|𝒉|𝑯|𝗁|𝖧|ⓗ|𝔥|ℌ|𝖍|𝕳|𝓱|𝓗|𝒽|𝐻|𝕙|ℍ|ｈ|🄷|ℋ|🅷|ђ|ԋ|ꮒ|ɧ|𝗵|𝗛|𝘩|𝘏|𝙝|𝙃|𝚑|𝙷|卄|ん|հ|ᕼ/g, 'h')
    .replace(/ƕ/g, 'hu')
    .replace(/ɪ|ᵢ|ᴵ|ᶦ|ⁱ|ι|ı|ɨ|ᶖ|ᴉ|𝐢|𝐈|𝒊|𝑰|𝗂|𝖨|𝚤|ⓘ|𝔦|ℑ|𝖎|𝕴|𝓲|𝓘|𝒾|𝑖|𝐼|𝕚|𝕀|ｉ|🄸|꠸|🅸|เ|ꭵ|𝗶|𝗜|𝘪|𝘐|𝙞|𝙄|𝚒|𝙸|丨|ﾉ|ᓰ|ᶤ/g, 'i')
    .replace(/ĳ/g, 'ij')
    .replace(
      /ᴊ|ⱼ|ᴶ|ʲ|ʝ|ɉ|ȷ|ɟ|𝐣|𝐉|𝑗|𝐽|𝒋|𝑱|𝔧|𝗃|𝖩|𝚥|ⓙ|𝔧|𝔍|𝖏|𝕵|𝓳|𝓙|𝒿|𝒥|𝕛|𝕁|ｊ|🄹|ℐ|ј|꠹|յ|🅹|ว|𝗷|𝗝|𝘫|𝘑|𝙟|𝙅|𝚓|𝙹|נ|ﾌ|ل|ᒍ|ᒚ|ڶ|ᒎ/g,
      'j',
    )
    .replace(
      /ᴋ|к|ₖ|ᴷ|ᵏ|ⱪ|ꝃ|ƙ|ꝁ|ꝅ|ᶄ|ʞ|𝐤|𝐊|𝑘|𝐾|𝒌|𝑲|𝗄|𝖪|ⓚ|𝔨|𝔎|𝖐|𝕶|𝓴|𝓚|𝓀|𝒦|𝕜|𝕂|ｋ|🄺|ҝ|ᛕ|🅺|ӄ|ꮶ|𝗸|𝗞|𝘬|𝘒|𝙠|𝙆|𝚔|𝙺|₭|ス|ҟ|ᖽᐸ|ҡ/g,
      'k',
    )
    .replace(
      /ʟ|ᴌ|ₗ|ᴸ|ˡ|ℓ|ⱡ|ꝉ|ŀ|ł|ꞁ|ɬ|ȴ|ᶅ|ɭ|ſ|ɿ|ן|𝐥|𝐋|𝒍|𝑳|𝗅|𝖫|⅃|ⓛ|𝔩|𝔏|𝖑|𝕷|𝓵|𝓛|𝓁|𝑙|𝐿|𝕝|𝕃|ｌ|🄻|ℒ|ᥣ|🅻|ʅ|ꮭ|ɩ|𝗹|𝗟|𝘭|𝘓|𝙡|𝙇|𝚕|𝙻|ᄂ|ㄥ|ﾚ|ӏ|ᒪ/g,
      'l',
    )
    .replace(/ǉ/g, 'lj')
    .replace(/ᴍ|м|ₘ|ᴹ|ᵐ|ɱ|ᵯ|ᶆ|ɰ|𝐦|𝐌|𝒎|𝑴|𝗆|𝖬|ⓜ|𝔪|𝔐|𝖒|𝕸|𝓶|𝓜|𝓂|𝑚|𝑀|𝕞|𝕄|ｍ|🄼|ℳ|ᗰ|🅼|๓|ꮇ|𝗺|𝗠|𝘮|𝘔|𝙢|𝙈|𝚖|𝙼|₥|爪|ﾶ|ᘻ|ϻ/g, 'm')
    .replace(
      /ɴ|ₙ|ᴺ|ⁿ|ᴎ|и|ꞃ|ɲ|ƞ|ȵ|ᵰ|ᶇ|ɳ|ᴝ|𝐧|𝐍|𝑛|𝑁|𝒏|𝑵|𝗇|𝖭|ⓝ|𝔫|𝔑|𝖓|𝕹|𝓷|𝓝|𝓃|𝒩|𝕟|ℕ|ｎ|🄽|🅽|ภ|ռ|ꮑ|ŋ|ຖ|𝗻|𝗡|𝘯|𝘕|𝙣|𝙉|𝚗|𝙽|п|η|₦|几|刀|ղ|ហ|ᑎ|ᘉ|ᶰ/g,
      'n',
    )
    .replace(/ǌ/g, 'nj')
    .replace(
      /ᴏ|ₒ|ᴼ|ᵒ|σ|ꝋ|ꝍ|ø|ȣ|ⱺ|ᴑ|ᴓ|𝐨|𝐎|𝑂|𝒐|𝑶|𝗈|𝖮|ⓞ|𝔬|𝔒|𝖔|𝕺|𝓸|𝓞|𝑜|𝒪|𝕠|𝕆|ｏ|ꭴ|🄾|❀|๏|օ|ꭷ|໐|𝗼|𝗢|𝘰|𝘖|𝙤|𝙊|𝚘|𝙾|ө|ð|ㄖ|の|♢|ට|ᓍ|♡|🏵|ᗝ|ο|❁|☯/g,
      'o',
    )
    .replace(/ꝏ/g, 'oo')
    .replace(/ɶ|œ|ᴔ/g, 'oe')
    .replace(/ƣ/g, 'on')
    .replace(
      /ᴘ|ₚ|ᴾ|ᵖ|ρ|ꝓ|ƥ|ꝕ|ᵽ|ꝑ|ᵱ|ᶈ|𝐩|𝐏|𝑝|𝑃|ꟼ|𝒑|𝑷|𝗉|𝖯|ⓟ|𝔭|𝔓|𝖕|𝕻|𝓹|𝓟|𝓅|𝒫|𝕡|ℙ|ｐ|🄿|℘|ק|ք|ꭾ|𝗽|𝗣|𝘱|𝘗|𝙥|𝙋|𝚙|𝙿|þ|₱|卩|ｱ|φ|ᑭ|ᕵ/g,
      'p',
    )
    .replace(/ǫ|ᵩ|ᵠ|ꝙ|ꝗ|ʠ|ɋ|𝐪|𝐐|𝒒|𝑸|𝗊|𝖰|ⓠ|𝔮|𝔔|𝖖|𝕼|𝓺|𝓠|𝓆|𝒬|𝕢|ℚ|ｑ|🅀|𝑞|𝑄|🆀|ϙ|զ|๑|𝗾|𝗤|𝘲|𝘘|𝙦|𝙌|𝚚|𝚀|ゐ|ҩ|ᑫ|ᕴ/g, 'q')
    .replace(
      /ʀ|ᵣ|ᴿ|ʳ|ᴕ|ᴚ|ʁ|ᴙ|я|ꞅ|ɍ|ɽ|ɾ|ɼ|ᵲ|ᶉ|ɹ|ɻ|ɺ|ⱹ|ꮧ|𝐫|𝐑|𝒓|𝑹|𝗋|𝖱|ⓡ|𝔯|ℜ|𝖗|𝕽|𝓻|𝓡|𝓇|𝑟|𝑅|𝕣|ℝ|ｒ|🅁|ℛ|ꭈ|🆁|г|ꮢ|ཞ|𝗿|𝗥|𝘳|𝘙|𝙧|𝙍|𝚛|𝚁|尺|འ|ᖇ/g,
      'r',
    )
    .replace(
      /ꜱ|ₛ|ˢ|ʂ|ᵴ|ᶊ|ȿ|ꝸ|𝐬|𝐒|𝑠|𝑆|𝒔|𝑺|𝗌|𝖲|ⓢ|ꙅ|𝔰|𝔖|𝖘|𝕾|𝓼|𝓢|𝓈|𝒮|𝕤|𝕊|ｓ|🅂|ᦓ|꯱|🆂|ร|ֆ|ꮥ|𝘀|𝗦|𝘴|𝘚|𝙨|𝙎|𝚜|𝚂|ƨ|ѕ|§|₴|丂|ϛ|ᔕ/g,
      's',
    )
    .replace(/ﬆ/g, 'st')
    .replace(
      /ᴛ|т|ₜ|ᵀ|ᵗ|ƚ|ɫ|ⱦ|ƭ|ʈ|ŧ|ȶ|ᵵ|ƫ|ʇ|𝐭|𝐓|𝒕|𝑻|𝗍|𝖳|ⓣ|𝔱|𝔗|𝖙|𝕿|𝓽|𝓣|𝓉|𝒯|𝕥|𝕋|ｔ|🅃|𝑇|🆃|ꮦ|𝘁|𝗧|𝘵|𝑡|𝘛|𝙩|𝙏|𝚝|𝚃|†|₮|ㄒ|ｲ|է|ͳ|ᖶ|丅/g,
      't',
    )
    .replace(/ᵺ/g, 'th')
    .replace(/ꜩ/g, 'tz')
    .replace(
      /ᴜ|ᵤ|ᵁ|ᵘ|ʋ|ᶙ|𝐮|𝐔|𝑢|𝑈|𝒖|𝑼|𝗎|𝖴|ⓤ|𝔲|𝔘|𝖚|𝖀|𝓾|𝓤|𝓊|𝒰|𝕦|𝕌|ｕ|🅄|υ|🆄|ย|ʊ|ꮼ|ꮰ|น|𝘂|𝗨|𝘶|𝘜|𝙪|𝙐|𝚞|𝚄|ц|µ|μ|ʉ|ㄩ|ひ|մ|ᑌ|ᑘ/g,
      'u',
    )
    .replace(/ᵫ/g, 'ue')
    .replace(/ᴠ|ᵥ|ⱽ|ᵛ|ν|ʌ|ꝟ|ⱴ|ᶌ|ⱱ|𝐯|𝐕|𝑣|𝑉|𝒗|𝑽|𝗏|𝖵|ⓥ|𝔳|𝔙|𝖛|𝖁|𝓿|𝓥|𝓋|𝒱|𝕧|𝕍|ｖ|🅅|🆅|ש|ꮙ|۷|ง|𝘃|𝗩|𝘷|𝘝|𝙫|𝙑|𝚟|𝚅|ᐯ|√|ѵ|ỽ|ᐺ/g, 'v')
    .replace(/ꝡ/g, 'vy')
    .replace(/ᴡ|ᵂ|ʷ|ω|ⱳ|ʍ|ɯ|𝐰|𝐖|𝑤|𝑊|𝒘|𝑾|𝗐|𝖶|ⓦ|𝔴|𝔚|𝖜|𝖂|𝔀|𝓦|𝓌|𝒲|𝕨|𝕎|ｗ|🅆|ฬ|🆆|ա|ꮗ|ຟ|𝘄|𝗪|𝘸|𝘞|𝙬|𝙒|𝚠|𝚆|щ|₩|山|చ|ᗯ|ᘺ/g, 'w')
    .replace(/χ|ₓ|ˣ|ᶍ|𝐱|𝐗|𝑥|𝑋|𝒙|𝑿|𝗑|𝖷|ⓧ|𝔵|𝔛|𝖝|𝖃|𝔁|𝓧|𝓍|𝒳|𝕩|𝕏|ｘ|🅇|🆇|א|ӽ|ҳ|𝘅|𝗫|𝘹|𝘟|𝙭|𝙓|𝚡|𝚇|×|ӿ|乂|ﾒ|ჯ|᙭|ж|ጀ/g, 'x')
    .replace(
      /ʏ|ᵧ|ʸ|ч|ƴ|ỿ|ɏ|ʎ|𝐲|𝐘|𝑦|𝑌|𝒚|𝒀|𝗒|𝖸|ⓨ|𝔶|𝔜|𝖞|𝖄|𝔂|𝓨|𝓎|𝒴|𝕪|𝕐|ｙ|🅈|ⴘ|ү|🆈|ץ|ყ|ꭹ|ฯ|𝘆|𝗬|𝘺|𝘠|𝙮|𝙔|𝚢|𝚈|у|¥|ㄚ|ﾘ|վ|ӌ|ᖻ/g,
      'y',
    )
    .replace(
      /ᴢ|ᶻ|ꝫ|ᵹ|ⱬ|ȥ|ƶ|ʑ|ᵶ|ᶎ|ʐ|ɀ|𝐳|𝐙|𝑧|𝑍|𝒛|𝒁|𝗓|𝖹|ⓩ|𝔷|ℨ|𝖟|𝖅|𝔃|𝓩|𝓏|𝒵|𝕫|ℤ|ｚ|🅉|ƺ|🆉|չ|ፚ|ຊ|𝘇|𝗭|𝘻|𝘡|𝙯|𝙕|𝚣|𝚉|乙|ᘔ|ᗱ|շ/g,
      'z',
    );
}

/**
 * For any given input text, reduce any repeating characters to a given maximum amount of repetitions.
 *
 * As an example, the input string: `"heeellllooooo"` becomes: `"heelloo"` if that number is 2, or
 * `"heeelllooo"` if that number is 3, or `helo` if that number is 1.
 *
 * For English, it is recommended to not use values lower than 2. If this preprocessing is used, make
 * sure that the bad words and allowed terms also feature at most the same number of repeated characters.
 * I.e. if using this with the number "2", there is no use of putting words like "helllo" on the lists.
 * @param inputText - The text from which to remove repeat characters.
 * @param maxAllowedCharsInSequence - The maximum number of characters in sequence (such as "aaa", "bbb",
 * ...) that are allowed to remain in the input string. `Recommended: 2 or 3`, depending on the language
 * of your input text.
 * @returns The input text with all repeat characters that occur more than the max amount in sequence
 * removed.
 * @throws If `maxAllowedCharsInSequence` is not an integer (such as 1.5) or if it is 0 or less.
 */
export function reduceRepeatCharacters(inputText: string, maxAllowedCharsInSequence: number = 2): string {
  if (!Number.isInteger(maxAllowedCharsInSequence) || maxAllowedCharsInSequence < 1) {
    throw new Error('reduceRepeatCharacters - maxAllowedCharsInSequence needs to be an integer that is larger than 0');
  }
  // match any word character `(\w)`, then refer to the last match `\1` and check if it appears
  // n or more times `{n,}` (where n is maxAllowedCharsInSequence)
  // replace this with our matched character '$1' repeated n times
  // in normal regexp terms this would be `string.replace(/(\w)\1{2,}/g, '$1$1')` if `n = 2`
  const regexp = new RegExp('(\\w)\\1{' + maxAllowedCharsInSequence + ',}', 'g');
  const replacementStr = '$1'.repeat(maxAllowedCharsInSequence);
  return inputText.replace(regexp, replacementStr);
}
