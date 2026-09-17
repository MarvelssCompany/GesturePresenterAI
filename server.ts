import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is not set in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Analyze Presentation or Document content
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { type, title, contentText, slidesOrSections } = req.body;

    if (!contentText && (!slidesOrSections || slidesOrSections.length === 0)) {
      return res.status(400).json({ error: "Missing content to analyze." });
    }

    const ai = getAIClient();
    const systemPrompt = `You are GesturePresenter AI's Presentation & Document Intelligence engine.
Analyze the following ${type === "pptx" ? "PowerPoint Presentation" : "Word Document"} titled "${title || "Untitled"}".
Provide a rich, highly practical, and presenter-ready breakdown in structured JSON format with EXACTLY the following keys:
- "summary": A crisp, cohesive 2-3 paragraph overview of the core subject matter.
- "keyPoints": An array of 4 to 8 primary takeaways/bullet points.
- "importantTerms": An array of objects with "term" and "definition" explaining key concepts or terminology used in the presentation/document.
- "presenterNotes": An array of strings containing specific guidance or talking points for each slide or section. Provide at least one actionable tip/note per slide/section.
- "possibleQuestions": An array of objects with "question" (what audience, teachers, or evaluators are likely to ask) and "sampleAnswer" (how the presenter should respond effectively).
- "simpleExplanation": A 1-minute "explain like I'm 10" simple breakdown of the main concept that anyone can understand quickly.

Respond in the language of the material (if Indonesian, respond in Indonesian; if English, in English). Return pure JSON only.`;

    const userPrompt = `Material Title: ${title}
Format: ${type}
Total Items: ${slidesOrSections?.length || 1}

Content Breakdown:
${(slidesOrSections || [])
  .map((item: any, i: number) => `--- Item ${i + 1}: ${item.title || "Section"} ---\n${item.text || ""}`)
  .join("\n\n") || contentText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Fallback clean regex
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    return res.json({
      success: true,
      analysis: parsedData,
    });
  } catch (error: any) {
    console.error("Error analyzing material with Gemini:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze presentation material.",
    });
  }
});

// Q&A / Ask AI during or before presentation
app.post("/api/gemini/ask", async (req, res) => {
  try {
    const { materialContext, currentSlideContext, currentSlideIndex, question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const ai = getAIClient();
    const systemPrompt = `You are GesturePresenter AI Assistant, the smart co-pilot for a presenter.
You have the complete presentation material and the current active slide/section context.
The presenter or audience member asks: "${question}".
Answer directly, concisely, and helpfully based strictly on the uploaded material.
If they ask for:
- "Jelaskan slide ini dengan bahasa sederhana": provide a very clear, relatable, jargon-free explanation.
- "Apa inti materi ini?": give the core punchline in 2-3 sentences.
- "Buatkan cara menjelaskan bagian ini selama 1 menit": provide an elevator pitch / speaking script.
- "Pertanyaan apa yang mungkin ditanyakan guru?": list 2-3 probing questions with concise answers.
Maintain an encouraging, expert presenter tone in the user's language (Indonesian or English as requested).`;

    const userPrompt = `Context:
Current Active Item (${currentSlideIndex !== undefined ? `Slide/Section ${currentSlideIndex + 1}` : "Overview"}):
${currentSlideContext || "None specified"}

Full Document Overview:
${materialContext?.slice(0, 10000) || "None"}

Presenter Query:
"${question}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({
      success: true,
      answer: response.text || "No response generated.",
    });
  } catch (error: any) {
    console.error("Error in AI Q&A:", error);
    return res.status(500).json({
      error: error.message || "Failed to answer question.",
    });
  }
});

// Dev vs Prod Vite handling
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GesturePresenter AI server running on port ${PORT}`);
  });
}

start();
