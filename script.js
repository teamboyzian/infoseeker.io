// script.js
const askBtn = document.getElementById('askBtn');
const clearBtn = document.getElementById('clearBtn');
const questionInput = document.getElementById('question');
const loader = document.getElementById('loader');
const answerSection = document.getElementById('answer-section');
const answerEl = document.getElementById('answer');
const sourcesEl = document.getElementById('sources');
const geminiOverlay = document.querySelector('.gemini-overlay');

function showLoader(on = true) {
  loader.classList.toggle('hidden', !on);
  askBtn.disabled = on;
  questionInput.disabled = on;
}

function showGeminiOverlay(on = true) {
  geminiOverlay.classList.toggle('hidden', !on);
  document.body.classList.toggle('blur', on);
}

function setAnswerText(text) {
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

async function askQuestion() {
  const q = questionInput.value.trim();
  if (!q) return;

  // Show Gemini overlay + loader
  showGeminiOverlay(true);
  answerSection.classList.add('hidden');
  showLoader(true);

  try {
    const resp = await fetch('/.netlify/functions/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error('Server error: ' + resp.status + ' ' + text);
    }

    const data = await resp.json();
    const answer = data.answer || 'No answer returned.';
    const sources = data.sources || [];

    // Hide Gemini overlay + blur
    showGeminiOverlay(false);

    // Show answer
    answerSection.classList.remove('hidden');
    setAnswerText(answer);
    renderSources(sources);
    answerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    showGeminiOverlay(false);
    answerSection.classList.remove('hidden');
    answerEl.innerText = 'Error: ' + (err.message || err);
    sourcesEl.innerHTML = '';
    console.error(err);
  } finally {
    showLoader(false);
  }
}

// Events
askBtn.addEventListener('click', askQuestion);
questionInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') askQuestion(); });
clearBtn.addEventListener('click', () => {
  questionInput.value = '';
  answerEl.innerText = '';
  sourcesEl.innerHTML = '';
  answerSection.classList.add('hidden');
});