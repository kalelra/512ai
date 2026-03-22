const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const app = express();
const PORT = 3512;
const ROOT = path.join(__dirname);
const INDEX = path.join(ROOT, 'index.html');
app.use(express.json({ limit: '10mb' }));
app.use('/editor', express.static(path.join(ROOT, 'editor')));
app.use(express.static(ROOT));
app.get('/api/content', (req, res) => {
  try { res.json({ success: true, html: fs.readFileSync(INDEX, 'utf8') }); }
  catch (e) { res.status(500).json({ success: false, error: e.message }); }
});
app.post('/api/deploy', (req, res) => {
  const { changes, message } = req.body;
  if (!changes || !Object.keys(changes).length) return res.status(400).json({ success: false, error: 'No changes' });
  try {
    let html = fs.readFileSync(INDEX, 'utf8');
    const applied = [], skipped = [];
    for (const [field, value] of Object.entries(changes)) {
      if (field.startsWith('visibility:')) continue;
      const before = html;
      const tagMatch = html.match(new RegExp('<([a-zA-Z0-9]+)[^>]*data-field="' + field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"'));
      if (tagMatch) {
        const tag = tagMatch[1];
        const esc = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('(<' + tag + '[^>]*data-field="' + esc + '"[^>]*>)(.*?)(<\\/' + tag + '>)', 's');
        html = html.replace(re, '$1' + String(value).replace(/\$/g, '$$$$') + '$3');
      }
      if (html !== before) applied.push(field);
      else {
        const fb = { 'seo-title': [/<title>[^<]*<\/title>/, '<title>' + value + '</title>'], 'seo-desc': [/(<meta\s+name="description"\s+content=")[^"]*(")/i, '$1' + value + '$2'], 'og-title': [/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, '$1' + value + '$2'], 'og-desc': [/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, '$1' + value + '$2'], 'canonical': [/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, '$1' + value + '$2'], 'cal-url': [/https:\/\/calendly\.com\/avilaricardoe\/free-ai-strategy-call/g, value], 'formspree-url': [/https:\/\/formspree\.io\/f\/[a-z0-9]+/g, value], 'contact-email': [/contact@512ai\.co/g, value] };
        if (fb[field]) { const prev = html; html = html.replace(fb[field][0], fb[field][1]); if (html !== prev) { applied.push(field); continue; } }
        skipped.push(field);
      }
    }
    fs.writeFileSync(INDEX, html, 'utf8');
    console.log('Applied:', applied, 'Skipped:', skipped);
    if (applied.length === 0) return res.json({ success: true, applied: [], skipped, message: 'No changes needed — values already match' });
    const msg = (message || 'Content update via 512AI editor').replace(/"/g, "'");
    try { execSync('git add index.html', { cwd: ROOT }); execSync('git commit -m "' + msg + '"', { cwd: ROOT }); exec('git push', { cwd: ROOT }, (e) => { if (e) console.error('Push error:', e.message); else console.log('Pushed'); }); } catch (g) { if (!g.message.includes('nothing to commit')) return res.status(500).json({ success: false, error: g.message }); }
    res.json({ success: true, applied, skipped });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});
app.get('/api/git/status', (req, res) => {
  try { res.json({ success: true, log: execSync('git log --oneline -10', { cwd: ROOT }).toString().trim() }); }
  catch (e) { res.status(500).json({ success: false, error: e.message }); }
});
app.listen(PORT, () => console.log('\n✅ 512AI Editor running at http://localhost:' + PORT + '/editor\n'));
