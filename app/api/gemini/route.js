import { GoogleGenerativeAI } from "@google/generative-ai";

// Predefined responses for portfolio queries
const portfolioResponses = {
  "introduce yourself": "Hello! I am Tarun Kumar's AI portfolio assistant. I can help you learn more about Tarun's projects, skills, and experience.",
  "projects": "Tarun Kumar has worked on a wide range of projects, including embedded systems development, software development, and embedded systems development.",
};

/**
 * Helper function to find the best match for a query
 */
function findBestMatch(userMessage) {
  const lowerCaseMessage = userMessage.toLowerCase();
  return Object.keys(portfolioResponses).find((key) =>
    lowerCaseMessage.includes(key.replace(/\?.*$/, "").trim())
  );
}

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    // Check for predefined response with fuzzy matching
    const matchedKey = findBestMatch(userMessage);
    if (matchedKey) {
      return new Response(JSON.stringify({ message: portfolioResponses[matchedKey] }), { status: 200 });
    }

    // If no predefined response, use Gemini AI
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ message: "API key is missing" }), { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // System Prompt to keep responses portfolio-specific
    const systemPrompt = `
      You are an AI-powered portfolio assistant for Tarun Kumar, a skilled software and embedded systems developer. 
      Your role is to provide informative, concise, and engaging responses about Tarun’s skills, projects, experience, and contact details. 

      **Response Guidelines:**
      - Keep responses **short and to the point** (2-4 sentences max).
      - Maintain a **professional yet approachable tone**.
      - Use **proper formatting** (e.g., bullet points for lists).
      - If asked about Tarun’s skills or projects, provide a **clear and structured** answer.
      - If asked for links or resources, refer to the relevant **sections on Tarun’s portfolio website**.

      If the user asks something unrelated to Tarun’s portfolio, respond with:  
      "I am here to assist with Tarun Kumar's portfolio-related queries. Let me know how I can help!"
    `;

    // Generate AI Response
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\nUser query: " + userMessage }] }
      ],
    });

    const botResponseRaw = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received";
    
    // Format response: remove Markdown-style bolding (**text**) and ensure proper newlines
    const botResponse = botResponseRaw
      .replace(/\*\*/g, '')      // Remove Markdown bold (**text** → text)
      .replace(/^- /gm, '')      // Remove markdown bullet points
      .replace(/\n/g, '<br>');   // Convert newlines for HTML rendering

    return new Response(JSON.stringify({ message: botResponse }), { status: 200 });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch response from Gemini AI" }), { status: 500 });
  }
}
