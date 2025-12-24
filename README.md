## Face Filter Advisor + Studio

This project is a single, unified demo:

- A **Face Filter Advisor** chat (AI helps you to choose) that talks with you about your context and recommends a face filter.
- An **AI-powered Face Filter Studio** that takes that recommendation, generates the asset using an image model, and previews it live on your webcam.

### What the Face Filter Advisor does

- Guides you through a short decision flow about:
  - Occasion (party, Zoom, TikTok, etc.).
  - Vibe (subtle, bold, professional, playful, etc.).
  - Comfort with eyes / lips / full-face filters.
- Produces a structured recommendation:
  - `filter_region`: `eyes` | `lips` | `full-face`
  - `filter_style`: short style label (e.g. `neon cyberpunk`, `subtle natural makeup`)
  - `filter_prompt`: a detailed text prompt for an image generation model.
- Shows a final message with the recommendation and a **“Generate this face filter”** button.

### What the Face Filter Studio does

- Accepts the advisor’s recommended prompt + region (or lets you type your own).
- Sends the prompt to a Python/Flask backend.
- The backend calls an external image generation API (currently wired to OpenAI's Images API) to generate a transparent PNG asset.
- The React/TypeScript frontend overlays that generated asset on top of a live webcam feed, approximating:
  - **Eyes**
  - **Lips**
  - **Full-face** masks or makeup.

Together, this shows an end-to-end pipeline for **deciding on and generating AI-based assets for face filters**.

### Running the backend (Flask)

1. Install dependencies (you may already have some of these):

```bash
pip install flask flask-cors requests
```

2. Set your OpenAI API key in the environment:

```bash
export OPENAI_API_KEY="sk-..."  # use your own key
```

3. Start the backend server from the project root:

```bash
python backend/cat_api.py
```

By default this runs on `http://localhost:5000`.

### Running the frontend (Vite + React + TypeScript)

1. Install frontend dependencies (from the project root):

```bash
npm install
```

2. Optionally configure the backend base URL (defaults to `http://localhost:5000`):

Create a `.env` file in the project root:

```bash
echo 'VITE_BACKEND_URL=http://localhost:5000' > .env
```

3. Start the dev server:

```bash
npm run dev
```

Open the printed URL in your browser (typically `http://localhost:5173`).

### Using the Face Filter Studio in the UI

- Open the app in your browser.
- Start in the **Decision AI** chat and describe your situation (e.g. “I need a fun filter for a birthday party on Zoom”).
- Answer the follow-up questions/options.
- When the advisor gives a final recommendation, click **“Generate this face filter”** under the last message.
- Allow webcam access in your browser.
- The app opens the **Face Filter Studio**, auto-fills the prompt/region, and generates the overlay.
- The generated asset appears on top of your webcam feed; you can still tweak the prompt or region and click **“Generate filter”** again.

You can click **"Back to Decision Chat"** at any time to return to the advisor.
