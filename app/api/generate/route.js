import { FormHelperText } from "@mui/material";
import { NextResponse } from "next/server";

const systemPrompt = `
You are a flashcard creator. 
Your task is to design effective flashcards by following these principles:

1. Focus on one concept per card.
2. Keep information concise and clear.
3. Use active recall by asking questions or prompts.
4. Incorporate spaced repetition to reinforce memory.
5. Include a variety of card types (definitions, multiple-choice, true/false).
6. Provide subtle hints for difficult concepts.
7. Adjust flashcards based on the learner’s progress and knowledge level.`;

export async function POST(req) {
  const data = await req.text();
  const apiKey = process.env.GEMINI_API_KEY; // Load your API key from .env.local

  try {
    const response = await fetch("https://api.gemini.com/v1/endpoint", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`, // Add your API key in the headers
        "Content-Type": "application/json", // Ensure the correct content type is set
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: data,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const flashcard = await response.json(); // Adjust this based on Gemini's API response format

    return NextResponse.json(flashcard.flashcards); // Return the generated flashcard
  } catch (error) {
    console.error("Error during Gemini API call:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcard" },
      { status: 500 }
    );
  }
}
