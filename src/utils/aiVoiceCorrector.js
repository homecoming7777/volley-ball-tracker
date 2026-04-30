export function aiVoiceCorrect(text) {
  if (!text) return "";

  let t = text.toLowerCase().trim();

  // ---------- common speech errors ----------
  const fixes = [
    [/won/g, "one"],
    [/tooo?|too/g, "two"],
    [/tree/g, "three"],
    [/for/g, "four"],
    [/ate/g, "eight"],

    [/killl+/g, "kill"],
    [/acce/g, "ace"],
    [/servingg/g, "serve"],
    [/receptionn/g, "reception"],
    [/homee/g, "home"],
    [/awayy/g, "away"],
  ];

  fixes.forEach(([pattern, replace]) => {
    t = t.replace(pattern, replace);
  });
  return t;
}
export function correctVoiceText(text) {
  return text
    .replace(/\bwon\b/g, "one")
    .replace(/\bto\b/g, "two")
    .replace(/\btoo\b/g, "two")
    .replace(/\btree\b/g, "three")
    .replace(/\bfor\b/g, "four")
    .replace(/\bate\b/g, "eight")

    .replace(/team a/g, "home")
    .replace(/team b/g, "away")

    .replace(/server/g, "serve")
    .replace(/spike/g, "attack")

    .replace(/\s+/g, " ")
    .trim();
}