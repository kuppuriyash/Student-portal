import Thumbnail from "../models/Thumbnail.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

export const generateThumbnail = async (req, res) => {
  try {
    const { userId } = req.session;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    if (!title || !style || !aspect_ratio || !color_scheme) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const aiPrompt = `
You are a professional YouTube thumbnail designer.

Create a detailed thumbnail design plan.

Title: "${title}"
Style: ${style}
Aspect Ratio: ${aspect_ratio}
Color Scheme: ${color_scheme}
Extra Notes: ${user_prompt || "None"}

Return STRICT JSON ONLY with these keys:
{
  "background": "",
  "main_subject": "",
  "facial_expression": "",
  "text_overlay": "",
  "font_style": "",
  "composition": "",
  "lighting": "",
  "mood": "",
  "cta_emotion": ""
}
`;

    const result = await model.generateContent(aiPrompt);
    const text = result.response.text();

    let designJSON;
    try {
      // Clean markdown if Gemini returned code blocks
      let cleanText = text;
      if (cleanText.includes("```json")) {
        cleanText = cleanText.split("```json")[1].split("```")[0].trim();
      } else if (cleanText.includes("```")) {
        cleanText = cleanText.split("```")[1].split("```")[0].trim();
      }
      designJSON = JSON.parse(cleanText);
    } catch {
      throw new Error("AI response was not valid JSON");
    }

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      user_prompt,
      prompt_used: aiPrompt,
      description: JSON.stringify(designJSON),
      image_url: null,
      isGenerating: false,
    });

    res.status(200).json({
      message: "Thumbnail design generated successfully",
      thumbnail,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteThumbnail = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Thumbnail.findOneAndDelete({ _id: id, userId });

    res.status(200).json({
      message: "Thumbnail deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
