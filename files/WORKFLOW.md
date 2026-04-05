# 512AI Dev Workflow — How Claude.ai + GitHub Stay in Sync

## The Problem
Claude.ai sandbox builds code but can't push to GitHub directly (no credentials).
Claude Code on your MacBook has credentials but doesn't know what was built in chat.

## The Solution — 2 options, use whichever fits:

### Option A: Download patch + apply (what we do today)
1. Claude.ai builds code, exports a .patch file
2. You download it, run: `bash apply-updates.sh`
3. Done — GitHub updated, Railway auto-deploys

### Option B: Clone and work locally (best for large features)
```bash
# First time only:
cd ~/Claude_Projects
git clone https://github.com/kalelra/512ai-backend

# Every session:
cd ~/Claude_Projects/512ai-backend
git pull origin main
# Make changes via Claude Code, then:
git add -A && git commit -m "your message" && git push origin main
```

## Directory Map (permanent reference)

| What | MacBook Path | GitHub Repo |
|------|-------------|-------------|
| 512AI Frontend | ~/Claude_Projects/512ai/ | kalelra/512ai |
| 512AI Backend | ~/Claude_Projects/512ai-backend/ | kalelra/512ai-backend |
| Business docs | ~/Claude_Projects/512ai-backend/docs/ | kalelra/512ai-backend/docs/ |

## Auto-Sync After Every Session Checklist
- [ ] Download patch from Claude.ai (if code was built here)
- [ ] Run `bash apply-updates.sh` in terminal  
- [ ] Verify on GitHub that changes are visible
- [ ] Railway auto-deploys from main (no action needed)
- [ ] Check `/health/deep` after deploy

## GitHub Actions Running Automatically
- `sync-docs.yml` — health check every 30 min, doc validation on push
- `content-sync.yml` — emails contact@512ai.co when website/docs need updating after a push
- `ci.yml` — tests + npm audit on every push
