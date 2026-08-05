import ai from "../config/ai.js";
import { buildCodeReviewPrompt } from "../utils/prompts.js";

const fallbackReview = (code, language) => ({
    score: 82,
    categories: {
        security: 78,
        performance: 80,
        quality: 84,
        maintainability: 86,
        readability: 88,
        bestPractices: 84,
    },
    summary: `A fallback review was generated for ${language || "the submitted code"
        } because Gemini was unavailable.`,
    bugs: [],
    securityIssues: [],
    performanceIssues: [],
    suggestions: [
        "Add unit tests.",
        "Improve documentation.",
        "Follow best practices."
    ],
    improvedCode: code,
});

export const reviewCode = async (code, language) => {
    try {
        if (!ai) {
            throw new Error("Gemini API key is not configured.");
        }

        const prompt = buildCodeReviewPrompt(code, language);

        const fullPrompt = `
You are an expert senior software engineer.

Return ONLY valid JSON.

The JSON must follow this structure exactly:

{
  "score": number,
  "categories": {
    "security": number,
    "performance": number,
    "quality": number,
    "maintainability": number,
    "readability": number,
    "bestPractices": number
  },
  "summary": "",
  "bugs": [],
  "securityIssues": [],
  "performanceIssues": [],
  "suggestions": [],
  "improvedCode": ""
}

Review this code:

${prompt}
`;

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            contents: fullPrompt,
        });

        const text = response.text;

        if (!text) {
            throw new Error("Gemini returned an empty response.");
        }

        const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleaned);

    } catch (error) {
        console.error("Gemini Error:", error.message);

        return fallbackReview(code, language);
    }
};