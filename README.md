# 🧠 BioMetallica Insight & Grant Automation Agent
<img width="1899" height="862" alt="image" src="https://github.com/user-attachments/assets/b4de833e-cff0-43e4-a866-f515777d32cf" />

## 🚀 Overview

**BioMetallica Insight Agent** is an AI-powered system designed to accelerate **grant discovery**, **technical insight generation**, and **R&D planning** for startups and researchers in deep-tech fields like **bioleaching**, **bioreactor development**, and **green metallurgy**.

The system supports the full pipeline from **document analysis** to **TRL assessment**, **validation guidance**, **unit economics simulation**, and **grant proposal generation** — all via a unified dashboard with intelligent automation.

---

<img width="1919" height="877" alt="image" src="https://github.com/user-attachments/assets/ae2e65de-7cd6-4e68-847f-193f7b8f8c14" />



## 🧩 System Components & Functions

| Function | Input | Output | Purpose | Packages Used |
|----------|-------|--------|---------|----------------|
| `process_uploaded_file()` | PDF, Scanned Handwritten File | Extracted Text (String) | Converts uploaded files to raw text using OCR | `pdfplumber`, `pytesseract`, `Pillow`, `pdf2image` |
| `run_llm_insight_analysis()` | Extracted Text, System Prompt | Insight Report (String) | Generates whitepaper-style technical analysis using LLM | `transformers` |
| `extract_trl_breakdown()` | Technical Content | TRL Breakdown (Dict) | Assesses readiness of bioreactor components | `re`, `gemini`|
| `suggest_validation_and_risks()` | Technical Content | Experimental Suggestions, Risk List | Identifies validation needs and technical risks | `openai`, `gemini` |
| `generate_rnd_pipeline()` | None or TRL Metadata | Timeline / R&D Roadmap | Builds roadmap from lab to deployment | `openai`, `gemini`, `datetime` |
| `simulate_unit_economics()` | Scale Parameters | Unit Cost, ROI, Payback Period | Simulates deployment economics | `numpy`, `pandas`, `matplotlib` |
| `search_grants()` | Keywords, Filters | Matching Grants (List) | Finds suitable grants from multiple databases | `requests`, `beautifulsoup4`, `grants.gov API`, `cordis API` |
| `generate_custom_proposal()` | Grant Info, Past Proposals, Summary | Draft Proposal (Doc or String) | Tailors proposals based on past data & summary | `gemini`, `docx`, `chromadb` |

---

## 📌 Key Features

- 🧾 **OCR-Based Document Ingestion**: Supports both digital PDFs and handwritten scans.
- 📊 **TRL Breakdown & Readiness Mapping**: Auto-analyzes uploaded documents and categorizes components by TRL level.
- 🔬 **Experimental Design & Risk Suggestions**: Provides actionable insights to de-risk technology deployment.
- 🧮 **Economic Simulation Engine**: Calculates expected ROI, payback period, and unit cost based on scale.
- 📝 **AI-Powered Proposal Generation**: Automatically generates tailored grant proposals using LLMs.
- 💸 **Grant Search & Matching**: Finds suitable grants based on your project scope and keywords.
- 📤 **Export to PDF**: All proposals and TRL analysis are exportable as black & white printable PDFs.

---

## 📂 Project Structure (Partial)

/app
├─ /actions
├─ /ai/flows
├─ /components/ui
├─ /api/grants/search.ts
├─ /dashboard
└─ /utils

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TailwindCSS, shadcn/ui
- **AI/LLM**: OpenRouter,Gemini
- **OCR & PDF Parsing**: pdfplumber, pytesseract
- **Data & Economics**: pandas, numpy, matplotlib
- **Document Generation**: python-docx, react-pdf
- **Search APIs**: grants.gov, CORDIS, BeautifulSoup

---

---

## 📄 License

MIT License — open for academic and research collaboration.

---

## 📬 Contact

📧 **nagarjunh77@gmail.com**  
📍 Bangalore, India


