import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let ai = null;

if (GEMINI_API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        console.log(`Gemini AI initialized with default model: ${GEMINI_MODEL}`);
    } catch (error) {
        console.error("Failed to initialize Gemini AI:", error.message);
    }
} else {
    console.log("GEMINI_API_KEY not found.");
}

if (DEEPSEEK_API_KEY) {
    console.log("DeepSeek API key found. Available as fallback.");
}

if (OPENAI_API_KEY) {
    console.log("OpenAI API key found. Available as fallback.");
}

export { ai, GEMINI_MODEL, DEEPSEEK_API_KEY, OPENAI_API_KEY };
export default ai;