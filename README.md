# 512AI — AI Tools for Austin Businesses

## Setup Guide

1. **Drop in the headshot** — place `ricardo-headshot.png` in the same folder as `index.html`.
2. **Register Formspree** — go to [formspree.io](https://formspree.io), create a free form, and copy your form ID (looks like `xabcd1234`).
3. **Update Formspree** — in `index.html`, find `https://formspree.io/f/PLACEHOLDER` and replace `PLACEHOLDER` with your form ID.
4. **Verify Calendly** — confirm `https://calendly.com/avilaricardoe` is your correct booking link (it appears twice in the file).
5. **Demo API** — the live demo widget calls the Claude API. In Claude artifact environments it works without a key. For standalone hosting, add your Anthropic API key via a backend proxy (do not expose it in client-side code).

## Deploy to GitHub Pages
1. Push this repo to GitHub.
2. Go to **Settings → Pages → Source** and select the `main` branch, root folder.
3. Your site will be live at `https://<your-username>.github.io/<repo-name>`.

## Deploy to Netlify
1. Drag and drop the project folder into [app.netlify.com/drop](https://app.netlify.com/drop).
2. Netlify will give you a live URL instantly. Add your custom domain `512ai.co` in the domain settings.
