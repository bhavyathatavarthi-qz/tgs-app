# TGS — Trust & Governance Service (Demo Platform)

A production-styled enterprise governance web app implementing the workflow you specified:

```
React UI → Express Backend → Company Policy Repository → Vector DB (HNSWLib)
→ Semantic Search → Groq LLM (Llama 3.3) → Governance Decision → React Dashboard
```

**Scope note:** This service does **not** calculate risk scores or autonomy zones.
Those are owned by the upstream Context Assessment Service (CAS) and are entered
directly on the "CAS Assessment" card as inputs — exactly as your spec requires.
TGS consumes them, retrieves relevant company policy via RAG, and produces a
governance decision using an LLM (Groq / Llama 3.3).

---

## 1. Project layout

```
tgs-app/
├── backend/                 Express API + LangChain JS RAG pipeline
│   ├── data/                 Source policy documents (your uploaded .docx files)
│   │   ├── abc_bank.docx
│   │   └── xyz_solutions.docx
│   ├── src/
│   │   ├── config.js          Env vars, company registry, dropdown option lists
│   │   ├── policyLoader.js     Parses POL-XXX records out of the .docx files
│   │   ├── vectorStoreManager.js  Builds/loads HNSWLib indexes, semantic search
│   │   ├── groqClient.js       Groq SDK wrapper (JSON-mode chat completion)
│   │   ├── promptBuilder.js    System + user prompt construction
│   │   ├── governanceEngine.js Orchestrates retrieval → prompt → LLM → validation
│   │   ├── buildIndex.js       CLI: pre-build vector indexes
│   │   └── routes/governance.js
│   ├── vectorstores/          Persisted HNSWLib indexes (generated, gitignored)
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/                 React + MUI dashboard
    ├── public/index.html
    └── src/
        ├── components/        RequestInfoCard, CasAssessmentCard, AnalyzeSection,
        │                      GovernanceResultCard, GovernanceChecksCard,
        │                      PoliciesReferencedCard, ExplanationCard,
        │                      RecommendationCard, AppHeader
        ├── pages/Dashboard.jsx
        ├── api/governanceApi.js
        ├── theme/theme.js, constants.js
        ├── App.jsx
        └── index.js
```

---

## 2. Prerequisites

- Node.js 18+ and npm
- A free Groq API key: https://console.groq.com/keys
- Build tools for the native HNSWLib module (already present on most systems):
  - macOS: Xcode Command Line Tools (`xcode-select --install`)
  - Linux: `build-essential` + `python3`
  - Windows: `npm install --global windows-build-tools` (or use WSL)

---

## 3. Backend setup (Python FastAPI)

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Copy .env.example to .env if not already done, and add your GROQ_API_KEY
cp .env.example .env
```

Start the Python backend:

```bash
python main.py
# or using uvicorn directly:
# uvicorn main:app --reload --port 5000
# → TGS listening on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`


---

## 4. Frontend setup

```bash
cd frontend
npm install
npm start
# → opens http://localhost:3000
```

The dev server proxies `/api/*` to `http://localhost:5000` (see `"proxy"` in
`frontend/package.json`), so no CORS configuration is needed locally. For a
production build served separately from the API, set
`REACT_APP_API_BASE_URL` to the backend's full URL.

---

## 5. How a request flows through the system

1. **Request Information** card — username, role, department, company,
   environment, and the natural-language query describing the action.
2. **CAS Assessment** card — risk score (0–100 slider) and zone (Zone 1–4
   radio group). These are **inputs only**; TGS never recomputes them.
3. **Analyze Governance** — `POST /api/governance` with the combined payload.
4. Backend pipeline (`governanceEngine.js`):
   - Loads/queries the HNSWLib vector store for the selected company
     (`ABC Bank` → `abc_bank.docx`, `XYZ Solutions` → `xyz_solutions.docx`).
   - Embeds the query locally via `@xenova/transformers`
     (`Xenova/all-MiniLM-L6-v2`, no API key required).
   - Retrieves the top-K most relevant policies (default 5).
   - Builds a structured prompt containing the request context, CAS inputs,
     and retrieved policy excerpts.
   - Calls Groq (`llama-3.3-70b-versatile` by default) in JSON-object mode.
   - Validates/normalizes the model's output against a strict schema before
     returning it — the API contract is guaranteed even if the model
     slightly deviates from instructions.
5. **Governance Result** — decision badge (Approved / Approved with
   Modification / Held / Blocked), the five governance checks, the policies
   referenced (accordion), a detailed explanation, and a recommended next
   action.

### API contract

`POST /api/governance`

```json
{
  "username": "jsmith",
  "role": "Senior DevOps Engineer",
  "department": "Infrastructure",
  "company": "ABC Bank",
  "environment": "Production",
  "query": "Deploy the latest build to production for the payments service",
  "cas": { "riskScore": 78, "zone": "Zone 3" }
}
```

```json
{
  "requestId": "…",
  "evaluatedAt": "2026-07-19T…Z",
  "company": "ABC Bank",
  "cas": { "riskScore": 78, "zone": "Zone 3", "zoneLabel": "Escalate", "zoneColor": "orange" },
  "decision": "HELD",
  "checks": [
    { "name": "Authorized Role", "status": "pass", "detail": "…" },
    { "name": "Environment", "status": "pass", "detail": "…" },
    { "name": "Consent", "status": "fail", "detail": "…" },
    { "name": "Policy Compliance", "status": "warning", "detail": "…" },
    { "name": "Accountability", "status": "pass", "detail": "…" }
  ],
  "policies": [
    { "id": "POL-013", "title": "Deploy Application to Production", "category": "Application Deployment", "summary": "…" }
  ],
  "reason": "…",
  "recommendation": "Obtain CAB approval before proceeding."
}
```

`GET /api/governance/meta` returns the dropdown option lists and zone
metadata so the frontend never hardcodes enums.

---

## 6. Adding another company

Drop a new `.docx` following the same `POL-XXX` structure into
`backend/data/`, then register it in `backend/src/config.js`:

```js
config.companyRegistry['New Co'] = {
  slug: 'new_co',
  sourceFile: path.join(config.dataDir, 'new_co.docx'),
};
```

Restart the backend (or run `npm run build:index`) and it appears
automatically in the Company dropdown.

---

## 7. Notes on the AI stack

- **Embeddings** run locally (no external API key) via `@xenova/transformers`,
  downloaded once on first use.
- **Vector store**: HNSWLib, persisted to `backend/vectorstores/<company>/`.
- **LLM**: Groq's free tier, `llama-3.3-70b-versatile` by default —
  configurable via `GROQ_MODEL` in `.env`.
- The LLM is instructed to cite only policy IDs present in the retrieved
  context and to prefer `HELD` over `APPROVED` when evidence is ambiguous —
  see `backend/src/promptBuilder.js` for the full system prompt.
