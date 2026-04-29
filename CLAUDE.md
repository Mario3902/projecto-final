# CLAUDE.md — Antigravity Kit

> This project uses the **Antigravity Kit** agent system located in `.agent/`.
> Claude Code must follow its protocols on every request.

---

## MANDATORY: Load Antigravity Rules

Before ANY response involving code or design, read and apply:

1. **Master rules**: `.agent/rules/GEMINI.md` — agent routing, tiers, socratic gate, final checklist
2. **Architecture**: `.agent/ARCHITECTURE.md` — agents, skills, workflows overview

---

## Agent & Skill Protocol

- **Agents**: `.agent/agents/<name>.md` — 20 specialist personas
- **Skills**: `.agent/skills/<name>/SKILL.md` — load only sections matching the request
- **Workflows**: `.agent/workflows/` — slash commands `/create`, `/debug`, `/plan`, etc.

### Auto-Routing (MANDATORY before code/design)

1. Identify domain from user request
2. Select matching agent from `.agent/agents/`
3. Load agent's required skills (check `skills:` frontmatter)
4. Apply agent rules and respond

### Request Classification

| Type | Action |
|------|--------|
| Question | Text only, no agent needed |
| Simple fix | TIER 1 lite + matching agent |
| Build/Create/Refactor | Full agent + skills + `{task-slug}.md` plan |
| Design/UI | `frontend-specialist` or `mobile-developer` agent |

---

## Validation Scripts

```bash
# Dev check
python .agent/scripts/checklist.py .

# Pre-deploy full suite
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

A task is NOT done until `checklist.py` passes.

---

## Language

Respond in user's language. Code stays in English.
