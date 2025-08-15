// netlify/functions/ask.js
// Node 18+ runtime assumed

const MATH_HINT_WORDS = [
  'solve', 'evaluate', 'derivative', 'integral', 'limit', 'equation', 'factor',
  'simplify', 'expand', 'root', 'graph', 'compute', 'probability', 'sum', 'series'
];
const MATH_REGEX = /[0-9][0-9\s\+\-\*\/\^\=\(\)\[\]\{\}\.\,\:]*[0-9]|\\(frac|sqrt|int|sum)|\b(d\/dx|dx|dy|sin|cos|tan|log|ln|lim)\b/i;

function looksLikeMath(q = '') {
  const s = q.toLowerCase();
  if (MATH_REGEX.test(s)) return true;
  return MATH_HINT_WORDS.some(w => s.includes(w));
}

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const {
      question = '',
      mode: clientMode // "math" | "web" | undefined
    } = JSON.parse(event.body || '{}');

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

    if (!OPENAI_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing environment variables: OPENAI_API_KEY' }) };
    }

    const serverThinksMath = looksLikeMath(question);
    const mode = clientMode === 'math' || (clientMode !== 'web' && serverThinksMath) ? 'math' : 'web';

    if (mode === 'math') {
      // --- Math Pipeline (no external web sources) ---
      const system = [
        'You are a rigorous math tutor.',
        'Solve problems step-by-step with clear, numbered steps.',
        'ALWAYS verify the final result by substitution or a quick reverse-check.',
        'If multiple interpretations exist, state assumptions briefly.',
        'Use plain text; include LaTeX only if necessary.'
      ].join(' ');

      const user = [
        'Solve the following problem step-by-step and then verify the final answer.',
        'Show these sections exactly:',
        '1) Steps',
        '2) Final Answer',
        '3) Verification',
        '',
        `Problem: ${question}`
      ].join('\n');

      const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.0,
          max_tokens: 900,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user }
          ]
        })
      });

      if (!openaiResp.ok) {
        const t = await openaiResp.text();
        return { statusCode: 502, body: JSON.stringify({ error: 'OpenAI API error (math)', details: t }) };
      }

      const data = await openaiResp.json();
      const answer = data?.choices?.[0]?.message?.content || 'No answer.';
      return {
        statusCode: 200,
        body: JSON.stringify({
          mode: 'math',
          answer,
          sources: [] // No external sources for pure math
        })
      };
    }

    // --- Web Pipeline (Google + OpenAI) ---
    if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing environment variables: GOOGLE_API_KEY or GOOGLE_CSE_ID' }) };
    }

    const q = encodeURIComponent(question);
    const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${q}&num=6`;

    const googleResp = await fetch(googleUrl);
    if (!googleResp.ok) {
      const t = await googleResp.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'Google API error', details: t }) };
    }

    const gjson = await googleResp.json();
    const items = gjson.items || [];
    const snippets = [];
    const sources = [];

    for (const it of items) {
      const title = it.title || it.displayLink || it.link;
      const link = it.link;
      const snippet = it.snippet || '';
      if (link) sources.push({ title, url: link });
      if (snippet) snippets.push({ title, link, snippet });
    }

    let context = 'Use ONLY the following Google snippets to answer. If uncertain, say so.\n\n';
    snippets.forEach((s, i) => {
      context += `Result ${i + 1}: ${s.title}\n${s.link}\nSnippet: ${s.snippet}\n\n`;
    });
    context += `User question: ${question}\n\nProvide a concise answer, then a short "Sources used" list.`;

    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // you can swap to gpt-4o/gpt-4 if desired
        temperature: 0.1,
        max_tokens: 900,
        messages: [
          { role: 'system', content: 'You answer strictly from provided web snippets and do not invent sources.' },
          { role: 'user', content: context }
        ]
      })
    });

    if (!openaiResp.ok) {
      const t = await openaiResp.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'OpenAI API error (web)', details: t }) };
    }

    const data = await openaiResp.json();
    const answer = data?.choices?.[0]?.message?.content || 'No answer generated.';
    return {
      statusCode: 200,
      body: JSON.stringify({
        mode: 'web',
        answer,
        sources: sources.slice(0, 6)
      })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', message: String(err) }) };
  }
};