# InfoSeeker | Ask, Search & Learn

InfoSeeker is a **hybrid AI question-answering web app** powered by **OpenAI** and **Google Custom Search**.  
It provides **accurate, up-to-date answers** sourced directly from Google search results, displayed in a **modern glassmorphic UI** with 9D-style animations.  

---

## Features

- **Ultra-modern, animated UI** with glassmorphic input and answer panels  
- **AI-powered answers** based on **Google search results only**  
- **Sources displayed** for each answer  
- **Typing animation** for answers  
- Fully **deployable on Netlify**  
- **Responsive**: Works on desktop and mobile  

---

## File Structure

InfoSeeker-Netlify/ │ ├── index.html               ← Main UI page ├── styles.css               ← Styling & animations ├── script.js                ← Frontend JS (fetches AI answer) │ ├── netlify/ │   └── functions/ │       └── ask.js           ← Netlify serverless function (Google + OpenAI integration) │ └── README.md                ← Project instructions

---

## Setup Instructions

### 1. Google Custom Search

1. Go to [Google Custom Search](https://cse.google.com) and **create a new search engine**.  
   - Set it to search **the entire web** (not just specific sites).  
   - Copy the **Search Engine ID (cx)**.

2. Go to [Google Cloud Console](https://console.cloud.google.com/), enable **Custom Search API**, and generate an **API key**.

---

### 2. OpenAI API

- Get your **OpenAI API key** from [OpenAI Dashboard](https://platform.openai.com/account/api-keys).

---

### 3. Netlify Setup

1. Create a **Netlify account** and link your GitHub repository (or drag & drop the folder).  
2. In Netlify dashboard → Site settings → Build & deploy → **Environment variables**, add:

OPENAI_API_KEY = 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 GOOGLE_API_KEY = AIzaSyDuV0O0A36jq76TLGMuHiqxExiuDqiDA2M GOOGLE_CSE_ID   = 5194149544e6041fa

3. Make sure your `netlify/functions/ask.js` file exists — this is the serverless backend endpoint.

---

### 4. Deploy

- If using GitHub: Push your project → Netlify automatically builds and deploys.  
- If using Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy
netlify deploy --prod


---

5. Usage

1. Visit your deployed site URL.


2. Type a question in the Ask box.


3. Click Ask or press Enter.


4. Wait for the AI to generate an answer (typing animation).


5. Sources used will appear below the answer.



Note: InfoSeeker may make mistakes; always verify important information using the provided sources.


---

6. Important Notes

All answers are based only on Google search results provided to the AI.

API quotas apply:

Google Custom Search API has free tier limits.

OpenAI API has token limits depending on your account.


Styling: Glassmorphic panels, 9D layered background, and animations are in styles.css.

Frontend JS: script.js handles interactions and calls the backend function.



---

7. Optional Enhancements

Add voice input using Web Speech API.

Add dark/light mode toggle.

Include additional animations or background themes.

Add analytics to track most asked questions.



---

8. Credits

Powered by Team Boyzian

OpenAI GPT for AI-generated answers

Google Custom Search API for source data

UI inspired by modern glassmorphic designs


---
