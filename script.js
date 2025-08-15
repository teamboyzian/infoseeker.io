// script.js
const askBtn = document.getElementById('askBtn');
const clearBtn = document.getElementById('clearBtn');
const questionInput = document.getElementById('question');
const loader = document.getElementById('loader');
const answerSection = document.getElementById('answer-section');
const answerEl = document.getElementById('answer');
const sourcesEl = document.getElementById('sources');

// ADDED: This function checks if the user's input looks like a math problem.
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

function showLoader(on = true) {
  loader.classList.toggle('hidden', !on);
  askBtn.disabled = on;
  questionInput.disabled = on;
}

function setAnswerText(text) {
  // typing effect
  answerEl.innerHTML = '';
  let i = 0;
  const speed = 18;
  function type() {
    if (i <= text.length) {
      answerEl.innerText = text.slice(0, i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

function renderSources(sources) {
  sourcesEl.innerHTML = '';
  if (!sources || sources.length === 0) return;
  const h = document.createElement('div');
  h.style.marginBottom = '8px';
  h.style.color = 'var(--muted)';
  h.textContent = 'Sources used:';
  sourcesEl.appendChild(h);

  sources.forEach(s => {
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = s.title || s.url;
    sourcesEl.appendChild(a);
  });
}

// UPDATED: This function now sends a 'mode' to the server.
async function askQuestion() {
  const q = questionInput.value.trim();
  if (!q) return;
  answerSection.classList.add('hidden');
  showLoader(true);

  // Decide the mode based on the question
  const mode = looksLikeMathClient(q) ? 'math' : 'web';

  try {
    const resp = await fetch('/.netlify/functions/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, mode }), // Send mode to the server
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error('Server error: ' + resp.status + ' ' + text);
    }

    const data = await resp.json();
    const answer = data.answer || 'No answer returned.';

    // Show answer
    answerSection.classList.remove('hidden');
    setAnswerText(answer);

    // Only show sources if the mode was 'web'
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

// events
askBtn.addEventListener('click', askQuestion);
questionInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') askQuestion(); });
clearBtn.addEventListener('click', () => {
  questionInput.value = '';
  answerEl.innerText = '';
  sourcesEl.innerHTML = '';
  answerSection.classList.add('hidden');
});
