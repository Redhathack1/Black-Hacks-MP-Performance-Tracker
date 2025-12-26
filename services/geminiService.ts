
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MatchData } from "../types";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";

export const extractMatchData = async (base64Image: string): Promise<MatchData | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          parts: [
            { text: "Analyze this match result screenshot and extract all player performance data into the requested JSON format." },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image.split(',')[1] || base64Image
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            date: { type: Type.STRING },
            map: { type: Type.STRING },
            mode: { type: Type.STRING },
            result: { type: Type.STRING },
            scoreline: { type: Type.STRING },
            players: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  kills: { type: Type.NUMBER },
                  deaths: { type: Type.NUMBER },
                  assists: { type: Type.NUMBER },
                  time: { type: Type.STRING },
                  impact: { type: Type.NUMBER },
                  isTeamMember: { type: Type.BOOLEAN }
                },
                required: ["name", "score", "kills", "deaths", "assists", "time", "impact", "isTeamMember"]
              }
            }
          },
          required: ["map", "mode", "result", "scoreline", "players"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      ...result,
      id: result.id || Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      date: result.date || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error extracting match data:", error);
    return null;
  }
};
