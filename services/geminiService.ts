
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeIncident = async (description: string, type: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a campus security AI, analyze this incident report. 
      Incident Type: ${type}
      Description: ${description}
      Provide a brief (1-2 sentence) priority assessment and one immediate safety tip for the reporter.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "Analysis unavailable. Proceed with caution.";
  }
};
