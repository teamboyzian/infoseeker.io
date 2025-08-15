// Add near top of script.js
function looksLikeMathClient(text = '') {
  const MATH_HINT_WORDS = [
    'solve','evaluate','derivative','integral','limit','equation','factor',
    'simplify','expand','root','graph','compute','probability','sum','series'
  ];
  const REG = /[0-9][0-9\s\+\-\*\/\^\=\(\)\[\]\{\}\.\,\:]*[0-9]|\\(frac|sqrt|int|sum)|\b(d\/dx|dx|dy|sin|cos|tan|log|ln|lim)\b/i;
  const s = text.toLowerCase();
  if (REG.test(s)) return true;
  return MATH_HINT_WORDS.some(w => s.includes(w));
}

// In askQuestion():
async function askQuestion() {
  const q = questionInput.value.trim();
  if (!q) return;
  answerSection.classList.add('hidden');
  showLoader(true);

  const mode = looksLikeMathClient(q) ? 'math' : 'web';

  try {
    const resp = await fetch('/.netlify/functions/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, mode })
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error('Server error: ' + resp.status + ' ' + text);
    }

    const data = await resp.json();
    const answer = data.answer || 'No answer.';

    answerSection.classList.remove('hidden');
    setAnswerText(answer);

    sourcesEl.innerHTML = '';
    if (data.mode === 'web' && Array.isArray(data.sources) && data.sources.length) {
      renderSources(data.sources);
    }
    // For math mode, no sources are shown (pure calculation).
    answerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    answerSection.classList.remove('hidden');
    answerEl.innerText = 'Error: ' + (err.message || err);
    sourcesEl.innerHTML = '';
  } finally {
    showLoader(false);
  }
}