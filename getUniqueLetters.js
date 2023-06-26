/**
 * Replaces all emojis in a text that feature a letter with
 * normal latin characters.
 * Example: "🇬⭕ 🔛" turns into "go on" or
 * "🅿🇺®️💰🇪" turns into "purse".
 * Note: This does NOT replace random emojis used to represent
 * or mask letters, such as '🌸' representing an 'O'.
 * @param {string} inputText 
 * @returns the input text, with all letter based emojis transformed to become text.
 */
function unEmoji(inputText) {
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
function removeTextAccents(inputText) {
    return inputText.normalize('NFD').replace(/[\u0300-\u036f]|[\u0591-\u05bd]|\u05bf|\u05c1|\u05c2|\u05c4|\u05c5|\u05c7|\u0711|[\u0730-\u074a]/g, '');
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
 * @param {string} inputText 
 * @returns the input text, with foreign or special alphabet letters translated
 * to latin lower case characters
 */
function textToLatin (inputText) {
    inputText = removeTextAccents(inputText);
    // replace upper case letters that look different in lower case
    inputText = inputText.replace(/Ð/g, 'd')
                         .replace(/Σ/g, 'e')
                         .replace(/Η/g, 'h')
                         .replace(/Ꮰ/g, 'j')
                         .replace(/Μ/g, 'm')
                         .replace(/Ꭴ/g, 'q')
                         .replace(/Շ/g, 't')
                         .replace(/Ա/g, 'u')
                         .replace(/Հ/g, 'z')
    // convert to lower case and replace the rest                  
    inputText = inputText.toLowerCase();
    return inputText.replace(/ᴀ|ₐ|ᴬ|ᵃ|α|ⱥ|ɐ|ᶏ|ẚ|𝐚|𝐀|ⓐ|𝔞|𝔄|𝖆|𝕬|𝓪|𝓐|𝒶|𝒜|𝕒|𝔸|ａ|🄰|ɑ|ค|𝗮|𝗔|𝘢|𝘈|𝙖|𝘼|𝚊|𝙰|λ|₳|卂|ﾑ|ᗩ/g,'a')
                    .replace(/ᴁ|æ|ᴂ/g,'ae')
                    .replace(/ꜵ/g,'ao')
                    .replace(/ꜷ/g,'au')
                    .replace(/ꜹ/g,'av')
                    .replace(/ꜻ|ꜳ/g,'aa')
                    .replace(/ꜽ/g,'ay')
                    .replace(/ʙ|ᴃ|в|ᵦ|ᴮ|ᵇ|ɓ|ƀ|ƃ|ᵬ|ᶀ|𝐛|𝐁|ⓑ|𝔟|𝔅|𝖇|𝕭|𝓫|𝓑|𝒷|𝐵|𝕓|𝔹|ｂ|🄱|ℬ|ϐ|๒|ⴆ|ɮ|ᏸ|ც|๖|𝗯|𝗕|𝘣|𝘉|𝙗|𝘽|𝚋|𝙱|ß|฿|乃|ҍ|β|ᗷ/g,'b')
                    .replace(/ᴄ|ᶜ|¢|ƈ|ȼ|ꞇ|𝒸|ɕ|ᶗ|ɔ|ↄ|ᴐ|𝐜|𝐂|ⓒ|𝔠|ℭ|𝖈|𝕮|𝓬|𝓒|𝒞|𝕔|ℂ|ｃ|🄲|ᥴ|🅲|ς|ፈ|𝗰|𝗖|𝘤|𝘊|𝙘|𝘾|𝚌|𝙲|ᄃ|₵|匚|↻|ᑕ|ᑢ|℃/g,'c')
                    .replace(/ᴅ|ᴰ|ᵈ|∂|ꝺ|ɗ|đ|ƌ|𝒹|ȡ|ᶑ|ᵭ|ᶁ|ɖ|𝐝|𝐃|ⓓ|𝔡|𝔇|𝖉|𝕯|𝓭|𝓓|𝒟|𝕕|𝔻|ｄ|🄳|ᗪ|ᦔ|ժ|🅳|๔|ԃ|ꮄ|໓|𝗱|𝗗|𝘥|𝘋|𝙙|𝘿|𝚍|𝙳|り|ꭰ|ᕲ/g,'d')
                    .replace(/ǳ|ǆ/g,'dz')
                    .replace(/ᴇ|ₑ|ᴱ|ᵉ|ⱻ|ɛ|є|ɇ|ɵ|ꜿ|ǝ|ⱸ|ᶒ|ᶓ|ɘ|𝐞|𝐄|ⓔ|𝔢|𝔈|𝖊|𝕰|𝓮|𝓔|𝑒|𝐸|𝕖|𝔼|ｅ|🄴|🅴|ҽ|ꮛ|𝗲|𝗘|𝘦|𝘌|𝙚|𝙀|𝚎|𝙴|乇|ξ|ᘿ|€|𝒆|ᗴ/g,'e')
                    .replace(/ꜰ|ᶠ|ƒ|ʄ|ꝭ|𝒻|ꝼ|ᵮ|ᶂ|ẜ|ẝ|ғ|ᵳ|𝐟|𝐅|ꟻ|ⓕ|𝔣|𝔉|𝖋|𝕱|𝓯|𝓕|𝐹|𝕗|𝔽|ｆ|🄵|ℱ|𝒇|ᠻ|⨍|🅵|ϝ|𝗳|𝗙|𝘧|𝘍|𝙛|𝙁|𝚏|𝙵|£|₣|ꭶ|千|ｷ|ᖴ/g,'f')
                    .replace(/ﬁ/g,'fi')
                    .replace(/ﬂ/g,'fl')
                    .replace(/ﬀ/g,'ff')
                    .replace(/ﬃ/g,'ffi')
                    .replace(/ﬄ/g,'ffl')
                    .replace(/ɢ|ʛ|ᴳ|ᵍ|ɠ|ǥ|ᶃ|ɡ|ᵷ|𝓰|𝐠|𝐆|ⓖ|𝔤|𝔊|𝖌|𝕲|𝓖|𝑔|𝒢|𝕘|𝔾|ｇ|🄶|ق|ᧁ|🅶|ﻮ|ꮆ|ງ|𝗴|𝗚|𝘨|𝘎|𝙜|𝙂|𝚐|𝙶|₲|ム|ց|ᘜ/g,'g')
                    .replace(/ʜ|н|ₕ|ᴴ|ʰ|ⱨ|ħ|ɦ|ɥ|ʮ|ʯ|𝐡|𝐇|ⓗ|𝔥|ℌ|𝖍|𝕳|𝓱|𝓗|𝒽|𝐻|𝕙|ℍ|ｈ|🄷|ℋ|🅷|ђ|ԋ|ꮒ|ɧ|𝗵|𝗛|𝘩|𝘏|𝙝|𝙃|𝚑|𝙷|卄|ん|հ|ᕼ/g,'h')
                    .replace(/ƕ/g,'hu')
                    .replace(/ɪ|ᵢ|ᴵ|ᶦ|ⁱ|ι|ı|ɨ|ᶖ|ᴉ|𝐢|𝐈|ⓘ|𝔦|ℑ|𝖎|𝕴|𝓲|𝓘|𝒾|𝐼|𝕚|𝕀|ｉ|🄸|꠸|🅸|เ|ꭵ|𝗶|𝗜|𝘪|𝘐|𝙞|𝙄|𝚒|𝙸|丨|ﾉ|ᓰ|ᶤ/g,'i')
                    .replace(/ĳ/g,'ij')
                    .replace(/ᴊ|ⱼ|ᴶ|ʲ|ʝ|ɉ|ȷ|ɟ|𝐣|𝐉|ⓙ|𝔧|𝔍|𝖏|𝕵|𝓳|𝓙|𝒿|𝒥|𝕛|𝕁|ｊ|🄹|ℐ|ј|꠹|յ|🅹|ว|𝗷|𝗝|𝘫|𝘑|𝙟|𝙅|𝚓|𝙹|נ|ﾌ|ل|ᒍ|ᒚ|ڶ|ᒎ/g,'j')
                    .replace(/ᴋ|к|ₖ|ᴷ|ᵏ|ⱪ|ꝃ|ƙ|ꝁ|ꝅ|ᶄ|ʞ|𝐤|𝐊|ⓚ|𝔨|𝔎|𝖐|𝕶|𝓴|𝓚|𝓀|𝒦|𝕜|𝕂|ｋ|🄺|ҝ|ᛕ|🅺|ӄ|ꮶ|𝗸|𝗞|𝘬|𝘒|𝙠|𝙆|𝚔|𝙺|₭|ス|ҟ|ᖽᐸ|ҡ/g,'k')
                    .replace(/ʟ|ᴌ|ₗ|ᴸ|ˡ|ℓ|ⱡ|ꝉ|ŀ|ł|ꞁ|ɬ|ȴ|ᶅ|ɭ|ſ|ɿ|ן|𝐥|𝐋|⅃|ⓛ|𝔩|𝔏|𝖑|𝕷|𝓵|𝓛|𝓁|𝐿|𝕝|𝕃|ｌ|🄻|ℒ|ᥣ|🅻|ʅ|ꮭ|ɩ|𝗹|𝗟|𝘭|𝘓|𝙡|𝙇|𝚕|𝙻|ᄂ|ㄥ|ﾚ|ӏ|ᒪ/g,'l')
                    .replace(/ǉ/g,'lj')
                    .replace(/ᴍ|м|ₘ|ᴹ|ᵐ|ɱ|ɯ|ᵯ|ᶆ|ɰ|𝐦|𝐌|ⓜ|𝔪|𝔐|𝖒|𝕸|𝓶|𝓜|𝓂|𝑀|𝕞|𝕄|ｍ|🄼|ℳ|ᗰ|🅼|๓|ꮇ|𝗺|𝗠|𝘮|𝘔|𝙢|𝙈|𝚖|𝙼|₥|爪|ﾶ|ᘻ|ϻ/g,'m')
                    .replace(/ɴ|ₙ|ᴺ|ⁿ|ᴎ|и|ꞃ|ɲ|ƞ|ȵ|ᵰ|ᶇ|ɳ|ᴝ|𝐧|𝐍|ⓝ|𝔫|𝔑|𝖓|𝕹|𝓷|𝓝|𝓃|𝒩|𝕟|ℕ|ｎ|🄽|🅽|ภ|ռ|ꮑ|ŋ|ຖ|𝗻|𝗡|𝘯|𝘕|𝙣|𝙉|𝚗|𝙽|п|η|₦|几|刀|ղ|ហ|ᑎ|ᘉ|ᶰ/g,'n')
                    .replace(/ǌ/g,'nj')
                    .replace(/ᴏ|ₒ|ᴼ|ᵒ|σ|ꝋ|ꝍ|ø|ȣ|ⱺ|ᴑ|ᴓ|𝐨|𝐎|ⓞ|𝔬|𝔒|𝖔|𝕺|𝓸|𝓞|𝑜|𝒪|𝕠|𝕆|ｏ|ꭴ|🄾|❀|๏|օ|ꭷ|໐|𝗼|𝗢|𝘰|𝘖|𝙤|𝙊|𝚘|𝙾|ө|ð|ㄖ|の|♢|ට|ᓍ|♡|🏵|ᗝ|ο|❁|☯/g,'o')
                    .replace(/ꝏ/g,'oo')
                    .replace(/ɶ|œ|ᴔ/g,'oe')
                    .replace(/ƣ/g,'on')
                    .replace(/ᴘ|ₚ|ᴾ|ᵖ|ρ|ꝓ|ƥ|ꝕ|ᵽ|ꝑ|ᵱ|ᶈ|𝐩|𝐏|ꟼ|ⓟ|𝔭|𝔓|𝖕|𝕻|𝓹|𝓟|𝓅|𝒫|𝕡|ℙ|ｐ|🄿|℘|ק|ք|ꭾ|𝗽|𝗣|𝘱|𝘗|𝙥|𝙋|𝚙|𝙿|þ|₱|卩|ｱ|φ|ᑭ|ᕵ/g,'p')
                    .replace(/ǫ|ᵩ|ᵠ|ꝙ|ꝗ|ʠ|ɋ|𝐪|𝐐|ⓠ|𝔮|𝔔|𝖖|𝕼|𝓺|𝓠|𝓆|𝒬|𝕢|ℚ|ｑ|🅀|𝑄|🆀|ϙ|զ|๑|𝗾|𝗤|𝘲|𝘘|𝙦|𝙌|𝚚|𝚀|ゐ|ҩ|ᑫ|ᕴ/g,'q')
                    .replace(/ʀ|ᵣ|ᴿ|ʳ|ᴕ|ᴚ|ʁ|ᴙ|я|ꞅ|ɍ|ɽ|ɾ|ɼ|ᵲ|ᶉ|ɹ|ɻ|ɺ|ⱹ|ꮧ|𝐫|𝐑|ⓡ|𝔯|ℜ|𝖗|𝕽|𝓻|𝓡|𝓇|𝑅|𝕣|ℝ|ｒ|🅁|ℛ|ꭈ|🆁|г|ꮢ|ཞ|𝗿|𝗥|𝘳|𝘙|𝙧|𝙍|𝚛|𝚁|尺|འ|ᖇ/g,'r')
                    .replace(/ꜱ|ₛ|ˢ|ʂ|ᵴ|ᶊ|ȿ|ꝸ|𝐬|𝐒|ⓢ|ꙅ|𝔰|𝔖|𝖘|𝕾|𝓼|𝓢|𝓈|𝒮|𝕤|𝕊|ｓ|🅂|ᦓ|꯱|🆂|ร|ֆ|ꮥ|𝘀|𝗦|𝘴|𝘚|𝙨|𝙎|𝚜|𝚂|ƨ|ѕ|§|₴|丂|ϛ|ᔕ/g,'s')
                    .replace(/ﬆ/g,'st')
                    .replace(/ᴛ|т|ₜ|ᵀ|ᵗ|ƚ|ɫ|ⱦ|ƭ|ʈ|ŧ|ȶ|ᵵ|ƫ|ʇ|𝐭|𝐓|ⓣ|𝔱|𝔗|𝖙|𝕿|𝓽|𝓣|𝓉|𝒯|𝕥|𝕋|ｔ|🅃|𝑇|🆃|ꮦ|𝘁|𝗧|𝘵|𝘛|𝙩|𝙏|𝚝|𝚃|†|₮|ㄒ|ｲ|է|ͳ|ᖶ|丅/g,'t')
                    .replace(/ᵺ/g,'th')
                    .replace(/ꜩ/g,'tz')
                    .replace(/ᴜ|ᵤ|ᵁ|ᵘ|ʋ|ᶙ|𝐮|𝐔|ⓤ|𝔲|𝔘|𝖚|𝖀|𝓾|𝓤|𝓊|𝒰|𝕦|𝕌|ｕ|🅄|υ|🆄|ย|ʊ|ꮼ|ꮰ|น|𝘂|𝗨|𝘶|𝘜|𝙪|𝙐|𝚞|𝚄|ц|µ|μ|ʉ|ㄩ|ひ|մ|ᑌ|ᑘ/g,'u')
                    .replace(/ᵫ/g,'ue')
                    .replace(/ᴠ|ᵥ|ⱽ|ᵛ|ν|ʌ|ꝟ|ⱴ|ᶌ|ⱱ|𝐯|𝐕|ⓥ|𝔳|𝔙|𝖛|𝖁|𝓿|𝓥|𝓋|𝒱|𝕧|𝕍|ｖ|🅅|🆅|ש|ꮙ|۷|ง|𝘃|𝗩|𝘷|𝘝|𝙫|𝙑|𝚟|𝚅|ᐯ|√|ѵ|ỽ|ᐺ/g,'v')
                    .replace(/ꝡ/g,'vy')
                    .replace(/ᴡ|ᵂ|ʷ|ω|ⱳ|ʍ|𝐰|𝐖|ⓦ|𝔴|𝔚|𝖜|𝖂|𝔀|𝓦|𝓌|𝒲|𝕨|𝕎|ｗ|🅆|ฬ|🆆|ա|ꮗ|ຟ|𝘄|𝗪|𝘸|𝘞|𝙬|𝙒|𝚠|𝚆|щ|₩|山|చ|ᗯ|ᘺ/g,'w')
                    .replace(/χ|ₓ|ˣ|ᶍ|𝐱|𝐗|ⓧ|𝔵|𝔛|𝖝|𝖃|𝔁|𝓧|𝓍|𝒳|𝕩|𝕏|ｘ|🅇|🆇|א|ӽ|ҳ|𝘅|𝗫|𝘹|𝘟|𝙭|𝙓|𝚡|𝚇|×|ӿ|乂|ﾒ|ჯ|᙭|ж|ጀ/g,'x')
                    .replace(/ʏ|ᵧ|ʸ|ч|ƴ|ỿ|ɏ|ʎ|𝐲|𝐘|ⓨ|𝔶|𝔜|𝖞|𝖄|𝔂|𝓨|𝓎|𝒴|𝕪|𝕐|ｙ|🅈|ⴘ|ү|🆈|ץ|ყ|ꭹ|ฯ|𝘆|𝗬|𝘺|𝘠|𝙮|𝙔|𝚢|𝚈|у|¥|ㄚ|ﾘ|վ|ӌ|ᖻ/g,'y')
                    .replace(/ᴢ|ᶻ|ꝫ|ᵹ|ⱬ|ȥ|ƶ|ʑ|ᵶ|ᶎ|ʐ|ɀ|𝐳|𝐙|ⓩ|𝔷|ℨ|𝖟|𝖅|𝔃|𝓩|𝓏|𝒵|𝕫|ℤ|ｚ|🅉|ƺ|🆉|չ|ፚ|ຊ|𝘇|𝗭|𝘻|𝘡|𝙯|𝙕|𝚣|𝚉|乙|ᘔ|ᗱ|շ/g,'z');
}

const text = '𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟' +
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
'𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕' +
'𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉ΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZαв¢∂єƒgнιנкℓмησρqяѕтυνωχуzαв¢∂єƒgнιנкℓмησρqяѕтυνωχуzåß¢Ðê£ghïjklmñðþqr§†µvwx¥zÄßÇÐÈ£GHÌJKLMñÖþQR§†ÚVW×¥Z₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙ﾑ乃ᄃり乇ｷムんﾉﾌスﾚﾶ刀のｱゐ尺丂ｲひ√Wﾒﾘ乙ﾑ乃ᄃり乇ｷムんﾉﾌスﾚﾶ刀のｱゐ尺丂ｲひ√Wﾒﾘ乙abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚΛＢＣＤΞＦＧＨＩＪＫＬＭＮ♢ＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZąҍçժҽƒցհìʝҟӀʍղօքզɾʂէմѵա×վՀȺβ↻ᎠƐƑƓǶįلҠꝈⱮហටφҨའϚͲԱỼచჯӋɀᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭YᘔᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭YᘔᗩᗷᑢᕲᘿᖴᘜᕼᓰᒚᖽᐸᒪᘻᘉᓍᕵᕴᖇSᖶᑘᐺᘺ᙭ᖻᗱᗩᗷᑢᕲᘿᖴᘜᕼᓰᒚᖽᐸᒪᘻᘉᓍᕵᕴᖇSᖶᑘᐺᘺ᙭ᖻᗱa̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶̶A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶a̴b̴c̴d̴e̴f̴g̴h̴i̴j̴k̴l̴m̴n̴o̴p̴q̴r̴s̴t̴u̴v̴w̴x̴y̴z̴̴A̴B̴C̴D̴E̴F̴G̴H̴I̴J̴K̴L̴M̴N̴O̴P̴Q̴R̴S̴T̴U̴V̴W̴X̴Y̴Z̴a̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z̷̷A̷B̷C̷D̷E̷F̷G̷H̷I̷J̷K̷L̷M̷N̷O̷P̷Q̷R̷S̷T̷U̷V̷W̷X̷Y̷Z̷a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲̲A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲'

var fs = require('fs');

let uniqueLetters = '';
let letterMap = {};
const alphabet = 'abcdefghijklmnopqrstuvwxyz';
let index = 0;
text2 = removeTextAccents(text);
text2 = text2.toUpperCase();
text2 += text2.toLowerCase();
[...text2].forEach(char => {
    if (!uniqueLetters.includes(char.toLowerCase())) {
        const correspondingLetter = alphabet[index%(alphabet.length)];
        console.log("Adding character: '" + correspondingLetter + '->' + char + "'")
        uniqueLetters += char;
        char = unEmoji(char);
        char = textToLatin(char).replace(/[a-zA-Z]/g, '');
        if (char && char !== '') {
            if (letterMap[correspondingLetter]) {
                letterMap[correspondingLetter] += '|' + char.toLowerCase();
            } else {
                letterMap[correspondingLetter] = char.toLowerCase();
            }
        }
    }
    index += 1;
});


const allChars = 'ᴀ|ₐ|ᴬ|ᵃ|α|ⱥ|ɐ|ᶏ|ẚ|𝐚|𝐀|ⓐ|𝔞|𝔄|𝖆|𝕬|𝓪|𝓐|𝒶|𝒜|𝕒|𝔸|ａ|🄰|ɑ|ค|𝗮|𝗔|𝘢|𝘈|𝙖|𝘼|𝚊|𝙰|λ|₳|卂|ﾑ|ᗩᴁ|æ|ᴂꜵꜷꜹꜻ|ꜳꜽʙ|ᴃ|в|ᵦ|ᴮ|ᵇ|ɓ|ƀ|ƃ|ᵬ|ᶀ|𝐛|𝐁|ⓑ|𝔟|𝔅|𝖇|𝕭|𝓫|𝓑|𝒷|𝐵|𝕓|𝔹|ｂ|🄱|ℬ|ϐ|๒|ⴆ|ɮ|ᏸ|ც|๖|𝗯|𝗕|𝘣|𝘉|𝙗|𝘽|𝚋|𝙱|ß|฿|乃|ҍ|β|ᗷᴄ|ᶜ|¢|ƈ|ȼ|ꞇ|𝒸|ɕ|ᶗ|ɔ|ↄ|ᴐ|𝐜|𝐂|ⓒ|𝔠|ℭ|𝖈|𝕮|𝓬|𝓒|𝒞|𝕔|ℂ|ｃ|🄲|ᥴ|🅲|ς|ፈ|𝗰|𝗖|𝘤|𝘊|𝙘|𝘾|𝚌|𝙲|ᄃ|₵|匚|↻|ᑕ|ᑢ|℃ᴅ|ᴰ|ᵈ|∂|ꝺ|ɗ|đ|ƌ|𝒹|ȡ|ᶑ|ᵭ|ᶁ|ɖ|𝐝|𝐃|ⓓ|𝔡|𝔇|𝖉|𝕯|𝓭|𝓓|𝒟|𝕕|𝔻|ｄ|🄳|ᗪ|ᦔ|ժ|🅳|๔|ԃ|ꮄ|໓|𝗱|𝗗|𝘥|𝘋|𝙙|𝘿|𝚍|𝙳|り|ꭰ|ᕲǳ|ǆᴇ|ₑ|ᴱ|ᵉ|ⱻ|ɛ|є|ɇ|ɵ|ꜿ|ǝ|ⱸ|ᶒ|ᶓ|ɘ|𝐞|𝐄|ⓔ|𝔢|𝔈|𝖊|𝕰|𝓮|𝓔|𝑒|𝐸|𝕖|𝔼|ｅ|🄴|🅴|ҽ|ꮛ|𝗲|𝗘|𝘦|𝘌|𝙚|𝙀|𝚎|𝙴|乇|ξ|ᘿ|€|𝒆|ᗴꜰ|ᶠ|ƒ|ʄ|ꝭ|𝒻|ꝼ|ᵮ|ᶂ|ẜ|ẝ|ғ|ᵳ|𝐟|𝐅|ꟻ|ⓕ|𝔣|𝔉|𝖋|𝕱|𝓯|𝓕|𝐹|𝕗|𝔽|ｆ|🄵|ℱ|𝒇|ᠻ|⨍|🅵|ϝ|𝗳|𝗙|𝘧|𝘍|𝙛|𝙁|𝚏|𝙵|£|₣|ꭶ|千|ｷ|ᖴﬁﬂﬀﬃﬄɢ|ʛ|ᴳ|ᵍ|ɠ|ǥ|ᶃ|ɡ|ᵷ|𝓰|𝐠|𝐆|ⓖ|𝔤|𝔊|𝖌|𝕲|𝓖|𝑔|𝒢|𝕘|𝔾|ｇ|🄶|ق|ᧁ|🅶|ﻮ|ꮆ|ງ|𝗴|𝗚|𝘨|𝘎|𝙜|𝙂|𝚐|𝙶|₲|ム|ց|ᘜʜ|н|ₕ|ᴴ|ʰ|ⱨ|ħ|ɦ|ɥ|ʮ|ʯ|𝐡|𝐇|ⓗ|𝔥|ℌ|𝖍|𝕳|𝓱|𝓗|𝒽|𝐻|𝕙|ℍ|ｈ|🄷|ℋ|🅷|ђ|ԋ|ꮒ|ɧ|𝗵|𝗛|𝘩|𝘏|𝙝|𝙃|𝚑|𝙷|卄|ん|հ|ᕼƕɪ|ᵢ|ᴵ|ᶦ|ⁱ|ι|ı|ɨ|ᶖ|ᴉ|𝐢|𝐈|ⓘ|𝔦|ℑ|𝖎|𝕴|𝓲|𝓘|𝒾|𝐼|𝕚|𝕀|ｉ|🄸|꠸|🅸|เ|ꭵ|𝗶|𝗜|𝘪|𝘐|𝙞|𝙄|𝚒|𝙸|丨|ﾉ|ᓰ|ᶤĳᴊ|ⱼ|ᴶ|ʲ|ʝ|ɉ|ȷ|ɟ|𝐣|𝐉|ⓙ|𝔧|𝔍|𝖏|𝕵|𝓳|𝓙|𝒿|𝒥|𝕛|𝕁|ｊ|🄹|ℐ|ј|꠹|յ|🅹|ว|𝗷|𝗝|𝘫|𝘑|𝙟|𝙅|𝚓|𝙹|נ|ﾌ|ل|ᒍ|ᒚ|ڶ|ᒎᴋ|к|ₖ|ᴷ|ᵏ|ⱪ|ꝃ|ƙ|ꝁ|ꝅ|ᶄ|ʞ|𝐤|𝐊|ⓚ|𝔨|𝔎|𝖐|𝕶|𝓴|𝓚|𝓀|𝒦|𝕜|𝕂|ｋ|🄺|ҝ|ᛕ|🅺|ӄ|ꮶ|𝗸|𝗞|𝘬|𝘒|𝙠|𝙆|𝚔|𝙺|₭|ス|ҟ|ᖽᐸ|ҡʟ|ᴌ|ₗ|ᴸ|ˡ|ℓ|ⱡ|ꝉ|ŀ|ł|ꞁ|ɬ|ȴ|ᶅ|ɭ|ſ|ɿ|ן|𝐥|𝐋|⅃|ⓛ|𝔩|𝔏|𝖑|𝕷|𝓵|𝓛|𝓁|𝐿|𝕝|𝕃|ｌ|🄻|ℒ|ᥣ|🅻|ʅ|ꮭ|ɩ|𝗹|𝗟|𝘭|𝘓|𝙡|𝙇|𝚕|𝙻|ᄂ|ㄥ|ﾚ|ӏ|ᒪǉᴍ|м|ₘ|ᴹ|ᵐ|ɱ|ɯ|ᵯ|ᶆ|ɰ|𝐦|𝐌|ⓜ|𝔪|𝔐|𝖒|𝕸|𝓶|𝓜|𝓂|𝑀|𝕞|𝕄|ｍ|🄼|ℳ|ᗰ|🅼|๓|ꮇ|𝗺|𝗠|𝘮|𝘔|𝙢|𝙈|𝚖|𝙼|₥|爪|ﾶ|ᘻ|ϻɴ|ₙ|ᴺ|ⁿ|ᴎ|и|ꞃ|ɲ|ƞ|ȵ|ᵰ|ᶇ|ɳ|ᴝ|𝐧|𝐍|ⓝ|𝔫|𝔑|𝖓|𝕹|𝓷|𝓝|𝓃|𝒩|𝕟|ℕ|ｎ|🄽|🅽|ภ|ռ|ꮑ|ŋ|ຖ|𝗻|𝗡|𝘯|𝘕|𝙣|𝙉|𝚗|𝙽|п|η|₦|几|刀|ղ|ហ|ᑎ|ᘉ|ᶰǌᴏ|ₒ|ᴼ|ᵒ|σ|ꝋ|ꝍ|ø|ȣ|ⱺ|ᴑ|ᴓ|𝐨|𝐎|ⓞ|𝔬|𝔒|𝖔|𝕺|𝓸|𝓞|𝑜|𝒪|𝕠|𝕆|ｏ|ꭴ|🄾|❀|๏|օ|ꭷ|໐|𝗼|𝗢|𝘰|𝘖|𝙤|𝙊|𝚘|𝙾|ө|ð|ㄖ|の|♢|ට|ᓍ|♡|🏵|ᗝ|ο|❁|☯ꝏɶ|œ|ᴔƣᴘ|ₚ|ᴾ|ᵖ|ρ|ꝓ|ƥ|ꝕ|ᵽ|ꝑ|ᵱ|ᶈ|𝐩|𝐏|ꟼ|ⓟ|𝔭|𝔓|𝖕|𝕻|𝓹|𝓟|𝓅|𝒫|𝕡|ℙ|ｐ|🄿|℘|ק|ք|ꭾ|𝗽|𝗣|𝘱|𝘗|𝙥|𝙋|𝚙|𝙿|þ|₱|卩|ｱ|φ|ᑭ|ᕵǫ|ᵩ|ᵠ|ꝙ|ꝗ|ʠ|ɋ|𝐪|𝐐|ⓠ|𝔮|𝔔|𝖖|𝕼|𝓺|𝓠|𝓆|𝒬|𝕢|ℚ|ｑ|🅀|𝑄|🆀|ϙ|զ|๑|𝗾|𝗤|𝘲|𝘘|𝙦|𝙌|𝚚|𝚀|ゐ|ҩ|ᑫ|ᕴʀ|ᵣ|ᴿ|ʳ|ᴕ|ᴚ|ʁ|ᴙ|я|ꞅ|ɍ|ɽ|ɾ|ɼ|ᵲ|ᶉ|ɹ|ɻ|ɺ|ⱹ|ꮧ|𝐫|𝐑|ⓡ|𝔯|ℜ|𝖗|𝕽|𝓻|𝓡|𝓇|𝑅|𝕣|ℝ|ｒ|🅁|ℛ|ꭈ|🆁|г|ꮢ|ཞ|𝗿|𝗥|𝘳|𝘙|𝙧|𝙍|𝚛|𝚁|尺|འ|ᖇꜱ|ₛ|ˢ|ʂ|ᵴ|ᶊ|ȿ|ꝸ|𝐬|𝐒|ⓢ|ꙅ|𝔰|𝔖|𝖘|𝕾|𝓼|𝓢|𝓈|𝒮|𝕤|𝕊|ｓ|🅂|ᦓ|꯱|🆂|ร|ֆ|ꮥ|𝘀|𝗦|𝘴|𝘚|𝙨|𝙎|𝚜|𝚂|ƨ|ѕ|§|₴|丂|ϛ|ᔕﬆᴛ|т|ₜ|ᵀ|ᵗ|ƚ|ɫ|ⱦ|ƭ|ʈ|ŧ|ȶ|ᵵ|ƫ|ʇ|𝐭|𝐓|ⓣ|𝔱|𝔗|𝖙|𝕿|𝓽|𝓣|𝓉|𝒯|𝕥|𝕋|ｔ|🅃|𝑇|🆃|ꮦ|𝘁|𝗧|𝘵|𝘛|𝙩|𝙏|𝚝|𝚃|†|₮|ㄒ|ｲ|է|ͳ|ᖶ|丅ᵺꜩᴜ|ᵤ|ᵁ|ᵘ|ʋ|ᶙ|𝐮|𝐔|ⓤ|𝔲|𝔘|𝖚|𝖀|𝓾|𝓤|𝓊|𝒰|𝕦|𝕌|ｕ|🅄|υ|🆄|ย|ʊ|ꮼ|ꮰ|น|𝘂|𝗨|𝘶|𝘜|𝙪|𝙐|𝚞|𝚄|ц|µ|μ|ʉ|ㄩ|ひ|մ|ᑌ|ᑘᵫᴠ|ᵥ|ⱽ|ᵛ|ν|ʌ|ꝟ|ⱴ|ᶌ|ⱱ|𝐯|𝐕|ⓥ|𝔳|𝔙|𝖛|𝖁|𝓿|𝓥|𝓋|𝒱|𝕧|𝕍|ｖ|🅅|🆅|ש|ꮙ|۷|ง|𝘃|𝗩|𝘷|𝘝|𝙫|𝙑|𝚟|𝚅|ᐯ|√|ѵ|ỽ|ᐺꝡᴡ|ᵂ|ʷ|ω|ⱳ|ʍ|𝐰|𝐖|ⓦ|𝔴|𝔚|𝖜|𝖂|𝔀|𝓦|𝓌|𝒲|𝕨|𝕎|ｗ|🅆|ฬ|🆆|ա|ꮗ|ຟ|𝘄|𝗪|𝘸|𝘞|𝙬|𝙒|𝚠|𝚆|щ|₩|山|చ|ᗯ|ᘺχ|ₓ|ˣ|ᶍ|𝐱|𝐗|ⓧ|𝔵|𝔛|𝖝|𝖃|𝔁|𝓧|𝓍|𝒳|𝕩|𝕏|ｘ|🅇|🆇|א|ӽ|ҳ|𝘅|𝗫|𝘹|𝘟|𝙭|𝙓|𝚡|𝚇|×|ӿ|乂|ﾒ|ჯ|᙭|ж|ጀʏ|ᵧ|ʸ|ч|ƴ|ỿ|ɏ|ʎ|𝐲|𝐘|ⓨ|𝔶|𝔜|𝖞|𝖄|𝔂|𝓨|𝓎|𝒴|𝕪|𝕐|ｙ|🅈|ⴘ|ү|🆈|ץ|ყ|ꭹ|ฯ|𝘆|𝗬|𝘺|𝘠|𝙮|𝙔|𝚢|𝚈|у|¥|ㄚ|ﾘ|վ|ӌ|ᖻᴢ|ᶻ|ꝫ|ᵹ|ⱬ|ȥ|ƶ|ʑ|ᵶ|ᶎ|ʐ|ɀ|𝐳|𝐙|ⓩ|𝔷|ℨ|𝖟|𝖅|𝔃|𝓩|𝓏|𝒵|𝕫|ℤ|ｚ|🅉|ƺ|🆉|չ|ፚ|ຊ|𝘇|𝗭|𝘻|𝘡|𝙯|𝙕|𝚣|𝚉|乙|ᘔ|ᗱ|շ'

// ᖽᐸ turns into K

console.log(uniqueLetters)
console.log(uniqueLetters.length)
console.log(letterMap);
console.log(text.length)
console.log("TEXT")
console.log(textToLatin(unEmoji(text2)).replace(/[a-zA-Z]/g, ''))

let allUppercaseChars = '';
[...allChars].forEach(char => {
    if (char.toLowerCase() !== char) {
        allUppercaseChars += char;
    }
})
console.log('Upper case stuff');
console.log(allUppercaseChars);

/*console.log(toLatin(text).replace(/[a-zA-Z]/g, '').replace(/(.)(?=.*\1)/g, ""))
console.log(toLatin(text).replace(/[a-zA-Z]/g, '').length)
console.log(toLatin(text).replace(/[a-zA-Z]/g, '').replace(/(.)(?=.*\1)/g, "").length)*/

