import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const { question } = JSON.parse(event.body);

    const systemPrompt = `
You are InfoSeeker AI. Answer user queries accurately.
If the question is about math, show step-by-step solution clearly.
Convert technical language like "binary", "LaTeX", or "code-like" formulas into normal language.
Keep the explanation easy and concise but correct.
`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.3,
        max_output_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { statusCode: response.status, body: errorText };
    }

    const data = await response.json();
    const answer = data.output_text || 'No answer available.';

    return {
      statusCode: 200,
      body: JSON.stringify({ answer }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}