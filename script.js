// script.js
const askBtn = document.getElementById('askBtn');
const clearBtn = document.getElementById('clearBtn');
const questionInput = document.getElementById('question');
const loader = document.getElementById('loader');
const answerSection = document.getElementById('answer-section');
const answerEl = document.getElementById('answer');
const sourcesEl = document.getElementById('sources');

function showLoader(on = true) {
  loader.classList.toggle('hidden', !on);
  askBtn.disabled = on;
  questionInput.disabled = on;

  if (on) {
    // inject animation HTML only when loader is shown
    loader.innerHTML = `
      <div class="ring ring1"></div>
      <div class="ring ring2"></div>
      <div class="ring ring3"></div>

      <div class="trail trail1"></div>
      <div class="trail trail2"></div>
      <div class="trail trail3"></div>
      <div class="trail trail4"></div>

      <div class="logo"></div>
      <div class="wait-text">Wait for a second...</div>

      <div class="particle particle1"></div>
      <div class="particle particle2"></div>
      <div class="particle particle3"></div>
      <div class="particle particle4"></div>
      <div class="particle particle5"></div>
      <div class="particle particle6"></div>
      <div class="particle particle7"></div>
      <div class="particle particle8"></div>
    `;
  } else {
    loader.innerHTML = ''; // remove animation when done
  }
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

async function askQuestion() {
  const q = questionInput.value.trim();
  if (!q) return;
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

    // show
    answerSection.classList.remove('hidden');
    setAnswerText(answer);
    renderSources(sources);
    // scroll into view
    answerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    answerSection.classList.remove('hidden');
    answerEl.innerText = 'Error: ' + (err.message || err);
    sourcesEl.innerHTML = '';
    console.error(err);
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