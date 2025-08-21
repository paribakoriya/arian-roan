
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set for Gemini. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const getStudyTipsStream = async (examName: string, examCategory: string) => {
  if (!ai) {
    throw new Error("Gemini API key not configured.");
  }

  const prompt = `Generate a concise, bulleted list of actionable study tips for the "${examName}" exam in the "${examCategory}" category. Focus on key strategies, important topics, and recommended resource types. Do not include a preamble or conclusion, just the bullet points. Use markdown for formatting.`;
  
  try {
    const response = await ai.models.generateContentStream({
       model: "gemini-2.5-flash",
       contents: prompt,
    });
    return response;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("Failed to get study tips from AI.");
  }
};
