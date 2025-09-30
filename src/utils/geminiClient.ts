import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in .env");
}

export const genAI = new GoogleGenerativeAI(apiKey);