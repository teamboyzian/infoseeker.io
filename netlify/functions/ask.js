// ask.js - Netlify Function
export async function handler(event) {
  try {
    const { question } = JSON.parse(event.body || "{}");

    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Question is required" }),
      };
    }

    // Call OpenAI GPT-4o-mini
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `
You are a math and general knowledge assistant. 
User asked: "${question}"

If it's math:
- Solve it completely.
- Show each step clearly.
- Use natural math symbols (like sqrt for square root, fractions like a/b).
- Explain in human-readable form, not code.
- Avoid programming language syntax unless explicitly requested.

If it's not math:
- Give a clear, concise answer.

Return only the explanation and steps, no JSON or extra tags.
        `,
      }),
    });

    const data = await response.json();
    const answer = data.output_text || "No answer returned.";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer }),
    };

  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal Server Error" }),
    };
  }
}