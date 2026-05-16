import fs from "node:fs/promises";
import path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const OUT = path.resolve("assets/generated");
const AUDIO_OUT = path.resolve("assets/audio");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";
const ASSET_LIMIT = Number(process.env.ASSET_LIMIT || 0);
const SPORTS = ["football", "basketball", "volleyball", "badminton", "tennis", "pickleball", "chess", "cycling", "jogging", "fishing", "swimming", "yoga", "karate", "aerobics"];
const STATES = ["idle", "attack", "hurt-sad"];

async function ensureDirs() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(AUDIO_OUT, { recursive: true });
}

async function generateGeminiImage(name, prompt) {
  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    }),
  });
  if (!response.ok) throw new Error(`Gemini failed ${response.status}: ${await response.text()}`);
  const json = await response.json();
  const parts = json.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data);
  if (!imagePart) throw new Error(`Gemini returned no image for ${name}`);
  await fs.writeFile(path.join(OUT, `${name}.png`), Buffer.from(imagePart.inlineData.data, "base64"));
}

async function generateVoice() {
  if (!ELEVENLABS_API_KEY) throw new Error("Missing ELEVENLABS_API_KEY");
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: "Hey ya!",
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.35, similarity_boost: 0.75, style: 0.55, use_speaker_boost: true },
    }),
  });
  if (!response.ok) throw new Error(`ElevenLabs failed ${response.status}: ${await response.text()}`);
  await fs.writeFile(path.join(AUDIO_OUT, "hey-ya.mp3"), Buffer.from(await response.arrayBuffer()));
}

function promptFor(sport, state) {
  const action = {
    football: "kicking a soccer ball",
    basketball: "jumping for a basketball dunk",
    volleyball: "jumping to spike a volleyball",
    badminton: "smashing a badminton shuttlecock with a racket",
    tennis: "smashing a tennis ball with a racket",
    pickleball: "smashing a pickleball with a paddle",
    chess: "flicking a chess piece forward",
    cycling: "riding a bicycle forward in a comic battle charge",
    jogging: "running forward in a fast dash",
    fishing: "swinging a fishing rod with a fish on the line",
    swimming: "sweeping water forward like a wave attack",
    yoga: "performing a powerful yoga kick pose",
    karate: "performing a karate kick",
    aerobics: "performing an energetic aerobics kick",
  }[sport];
  return [
    "Create a transparent-background PNG sprite for a friendly classroom sports battle game.",
    "Subject: one stylized teen student hero, anime-inspired educational game style.",
    `Sport/action: ${action}.`,
    `State: ${state}.`,
    "Full body, dynamic pose, clean silhouette, no text, no logo.",
    "If true transparency is not possible, use a perfectly flat solid #00ff00 chroma-key background with no shadows, gradients, checkerboard, texture, or floor.",
    "Keep style consistent with a colorful classroom RPG battle game for ESL students.",
  ].join("\n");
}

await ensureDirs();
let generatedCount = 0;
for (const sport of SPORTS) {
  for (const state of STATES) {
    if (ASSET_LIMIT && generatedCount >= ASSET_LIMIT) break;
    const name = `student-${sport}-${state}`;
    console.log(`Generating ${name}`);
    await generateGeminiImage(name, promptFor(sport, state));
    generatedCount += 1;
  }
  if (ASSET_LIMIT && generatedCount >= ASSET_LIMIT) break;
}
console.log("Generating ElevenLabs hey-ya.mp3");
await generateVoice();
