import { GoogleGenAI, Type } from "@google/genai";
import { FileMeta, FileType } from "../types";
import { blobToBase64 } from "../utils";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFileSummary = async (file: FileMeta): Promise<{ summary: string; tags: string[] }> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key missing");
    }

    if (file.type === FileType.IMAGE && file.blob) {
      const base64Data = await blobToBase64(file.blob);
      // gemini-2.5-flash-image does NOT support responseMimeType: "application/json"
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType: file.mimeType, data: base64Data } },
            { text: "Analyze this image. Return a raw JSON object with a 'summary' (max 2 sentences description) and 'tags' (array of 3-5 keywords). Do not wrap in markdown code blocks." }
          ]
        }
      });
      
      let text = response.text || '{}';
      // Cleanup potential markdown formatting
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn("Failed to parse JSON from image model:", text);
        return { summary: text, tags: [] };
      }
    } 
    else if (file.type === FileType.TEXT && file.content) {
      // Truncate content if too long to save tokens
      const textSample = file.content.slice(0, 10000);
      
      // gemini-3-flash-preview supports structured JSON schema
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following text file named "${file.name}".\n\nContent:\n${textSample}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "A concise overview of the file content." },
              tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant keywords." }
            },
            required: ["summary", "tags"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    }

    return { summary: "File type not supported for auto-analysis", tags: [] };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { summary: "Failed to analyze file.", tags: [] };
  }
};

export const chatWithFile = async (file: FileMeta, message: string, history: {role: string, content: string}[]): Promise<string> => {
    try {
        if (!process.env.API_KEY) return "API Key missing.";

        let parts: any[] = [];
        
        if (file.type === FileType.IMAGE && file.blob) {
             const base64Data = await blobToBase64(file.blob);
             parts.push({ inlineData: { mimeType: file.mimeType, data: base64Data } });
        } else if (file.type === FileType.TEXT && file.content) {
             parts.push({ text: `Context File Content:\n${file.content.slice(0, 20000)}\n\n` });
        }

        parts.push({ text: message });

        // Using generateContent for single turn with context context for simplicity in this demo,
        // but for multi-turn chat we would usually use ai.chats.create.
        // However, since we are attaching the file content every time for context (statelessness), 
        // a simple generateContent works well for this "ask about this specific file" usecase.
        
        const model = file.type === FileType.IMAGE ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview';

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts }
        });

        return response.text || "I couldn't generate a response.";

    } catch (e) {
        console.error(e);
        return "Error communicating with Gemini.";
    }
}