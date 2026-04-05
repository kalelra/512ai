# 512AI Voice Demo — Setup Guide
**Time to complete: ~20 minutes**

---

## What You're Deploying

1. `netlify/functions/voice-demo.js` — serverless function that calls Bland.ai
2. Voice demo section added to your website
3. Two environment variables added to Netlify

---

## Step 1 — Add Environment Variables to Netlify

Go to **app.netlify.com** → your 512ai site → **Site configuration → Environment variables** → Add these two:

| Key | Value |
|-----|-------|
| `BLAND_API_KEY` | Your Bland.ai API key |
| `TWILIO_PHONE_NUMBER` | +15126472949 |

---

## Step 2 — Copy the Netlify Function

In your terminal:

```bash
cd ~/Claude_Projects/512ai
cp ~/Downloads/voice-demo-function.js netlify/functions/voice-demo.js
```

Verify it's there:
```bash
ls netlify/functions/
```

Should show: `claude-proxy.js` and `voice-demo.js`

---

## Step 3 — Add the Voice Demo Section to Your Site

Open Claude Code:
```bash
cd ~/Claude_Projects/512ai
claude
```

Paste this prompt:
```
Read CLAUDE.md. 

1. Add "Voice Demo" to the navigation links between "Demo" and "About" — it should scroll to #voice-demo

2. Insert the contents of the file ~/Downloads/voice-demo-widget.html as a new section in index.html, placed BETWEEN the existing #demo section and the #how section.

3. After adding: git add . && git commit -m "Add AI voice demo section and Netlify function" && git push
```

---

## Step 4 — Trigger Netlify Redeploy

After pushing, Netlify auto-deploys. Go to app.netlify.com → Deploys and watch for the green "Published" status.

**Important:** After adding new environment variables, trigger a manual redeploy:
Deploys → Trigger deploy → Deploy site

---

## Step 5 — Test It

1. Go to **512ai.co** → scroll to the Voice Demo section
2. Enter YOUR name, select a business type, enter YOUR phone number
3. Click "Call Me Now"
4. Your phone rings within 30 seconds — answer it!

If the call doesn't come:
- Check Netlify → Functions tab for errors
- Check Bland.ai dashboard for call logs
- Verify environment variables are set correctly

---

## Step 6 — Configure Twilio (Optional Enhancement)

For now, Bland.ai handles calls directly. Later you can route through your Twilio number so calls show up as coming from your 512 number.

In Twilio console → Phone Numbers → your number → Voice Configuration:
- A call comes in: Webhook
- URL: `https://512ai.co/.netlify/functions/voice-demo`
- HTTP: POST

---

## Cost Estimate

| Usage | Cost |
|-------|------|
| 10 demo calls/month (avg 90 sec each) | ~$1.05 |
| 50 demo calls/month | ~$5.25 |
| 100 demo calls/month | ~$10.50 |

Bland.ai charges ~$0.07/minute. Your Twilio trial credit covers SMS and any Twilio-routed calls.

---

## Rate Limiting (Recommended)

To prevent abuse, add a rate limit after going live. The function currently allows unlimited calls per IP. 
Ask me to add IP-based rate limiting once you've confirmed the demo works.

---

## Troubleshooting

**"Network error"** → Server function not deployed or environment variables missing
**"Something went wrong"** → Check Bland.ai API key is correct
**No ring** → Check phone number format (must be US, 10 digits)
**Ring but no AI** → Check Bland.ai dashboard for call details and errors
