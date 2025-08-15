import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const { question, mathMode, imageBase64 } = JSON.parse(event.body);

    if (!question && !imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing question or image' }),
      };
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing environment variables' }),
      };
    }

    const messages = [];

    if (mathMode) {
      messages.push({
        role: 'system',
        content: 'You are a math tutor. Solve step by step and explain clearly. If formula is in code or binary, convert it to normal math first.',
      });
    } else {
      messages.push({ role: 'system', content: 'You are an expert assistant for general questions.' });
    }

    if (question) {
      messages.push({ role: 'user', content: question });
    }

    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image and answer any math or text question.' },
          {
            type: 'image_url',
            image_url: `data:image/jpeg;base64,${imageBase64}`,
          },
        ],
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
      }),
    });

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content || 'No answer generated.';

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer,
        sources: [], // Can be extended if you want Google search integration later
      }),
    };
  } catch (err) {
    console.error('Error in ask.js:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}