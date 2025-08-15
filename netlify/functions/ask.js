exports.handler = async (event) => {
  try {
    const { question } = JSON.parse(event.body);

    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Question is required' }),
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing API Key in environment variables' }),
      };
    }

    const prompt = `Answer this question accurately and in detail: ${question}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const answer = data.choices?.[0]?.message?.content || 'No answer found.';

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer,
        sources: [
          { title: 'Google Search', url: `https://www.google.com/search?q=${encodeURIComponent(question)}` },
        ],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};