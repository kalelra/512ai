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

// Read index.html
app.get('/api/content', (req, res) => {
  try {
    const html = fs.readFileSync(INDEX, 'utf8');
    res.json({ success: true, html });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Write index.html
app.post('/api/content', (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).json({ success: false, error: 'No HTML provided' });
    fs.writeFileSync(INDEX, html, 'utf8');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Git status
app.get('/api/git/status', (req, res) => {
  try {
    const status = execSync('git status --short', { cwd: ROOT }).toString().trim();
    const log = execSync('git log --oneline -8', { cwd: ROOT }).toString().trim();
    res.json({ success: true, status, log });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Git commit and push
app.post('/api/git/deploy', (req, res) => {
  const { message } = req.body;
  const msg = message || 'Content update via 512AI editor';
  exec(`git add . && git commit -m "${msg}" && git push`, { cwd: ROOT }, (err, stdout, stderr) => {
    if (err && !stdout.includes('nothing to commit')) {
      return res.status(500).json({ success: false, error: stderr || err.message, stdout });
    }
    res.json({ success: true, output: stdout });
  });
});

// Field-level patch — update a specific text pattern in index.html
app.post('/api/patch', (req, res) => {
  try {
    const { patches } = req.body;
    let html = fs.readFileSync(INDEX, 'utf8');
    const results = [];
    for (const patch of patches) {
      const { selector, value } = patch;
      const before = html;
      // Support regex-based replacement
      const re = new RegExp(selector, 'gs');
      html = html.replace(re, value);
      results.push({ selector, changed: html !== before });
    }
    fs.writeFileSync(INDEX, html, 'utf8');
    res.json({ success: true, results });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ 512AI Editor running at http://localhost:${PORT}/editor\n`);
});
