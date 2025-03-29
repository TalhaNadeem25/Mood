import { GoogleGenerativeAI } from "@google/generative-ai";

export const initGemini = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
}; 