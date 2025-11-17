# Evaluation as a Service (EaaS)

A comprehensive platform for evaluating LLM outputs with automated scoring, trend tracking, and CI/CD integration.

## 🎯 Overview

EaaS enables engineers, QA teams, and researchers to:
- Upload datasets of prompts and model outputs
- Define evaluation criteria (rubrics) using LLM judges, automated metrics, or rule-based scoring
- Automatically compute performance scores
- Track trends across model versions
- Integrate evaluations into CI/CD pipelines

## ✨ Features

- **Multiple Evaluation Methods**
  - LLM-based judges (GPT-4, Claude)
  - Automated metrics (BLEU, ROUGE, semantic similarity)
  - Rule-based scoring (keyword matching, regex patterns)

- **Batch Processing**
  - Evaluate hundreds of examples at once
  - Async worker architecture for scalability

- **Trend Tracking**
  - Visualize performance over time
  - Compare evaluations side-by-side
  - Identify regressions and improvements

- **CI/CD Integration**
  - REST API for programmatic access
  - GitHub Actions workflow examples
  - Pass/fail thresholds for deployment gates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Supabase account
- OpenAI API key (for LLM-based evaluations)

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema in the Supabase SQL Editor:

```bash
# Copy the schema from supabase-schema.sql and run it in Supabase SQL Editor
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
# OPENAI_API_KEY=your-openai-api-key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 3. Worker Setup

```bash
# Navigate to worker directory
cd worker

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# SUPABASE_URL=your-supabase-url
# SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
# OPENAI_API_KEY=your-openai-api-key

# Run worker
python worker.py
```

## 📖 Usage

### Creating an Evaluation

1. Navigate to `/upload`
2. Enter an evaluation name
3. Upload a CSV or JSON dataset with columns:
   - `prompt` (required)
   - `model_output` (required)
   - `expected_output` (optional, required for BLEU/ROUGE)
4. Select an evaluation rubric
5. Optionally set a pass threshold
6. Click "Start Evaluation"

### Viewing Results

1. Navigate to `/history` to see all evaluations
2. Click on an evaluation to view detailed results
3. Download results as CSV
4. Compare with other evaluations

### CI/CD Integration

Use the `/api/evaluations/run` endpoint to trigger evaluations from your CI/CD pipeline:

```bash
curl -X POST https://your-domain.com/api/evaluations/run \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_name": "My Test Dataset",
    "model_version": "v1.0.0",
    "threshold": 0.8,
    "items": [
      {
        "prompt": "What is 2+2?",
        "expected_output": "4",
        "model_output": "4"
      }
    ]
  }'
```

Check the status:

```bash
curl https://your-domain.com/api/evaluations/status?id=<evaluation_id>
```

See `.github/workflows/evaluation.yml` for a complete GitHub Actions example.

## 🏗️ Architecture

### Frontend (Next.js)
- `/upload` - Dataset upload and evaluation creation
- `/evaluation/[id]` - Detailed results view
- `/history` - Evaluation history with trends
- `/compare` - Side-by-side comparison

### Backend (Next.js API Routes)
- `POST /api/evaluations/create` - Create new evaluation
- `GET /api/evaluations/[id]` - Get evaluation details
- `GET /api/evaluations/list` - List all evaluations
- `GET /api/evaluations/status` - Check evaluation status
- `POST /api/evaluations/run` - CI/CD endpoint

### Worker (Python)
- Polls Supabase for pending evaluations
- Processes items using configured rubrics
- Updates scores and explanations
- Handles retries and error cases

### Database (Supabase/PostgreSQL)
- `evaluations` - Evaluation metadata
- `evaluation_items` - Individual test cases
- `rubrics` - Reusable evaluation criteria
- `evaluation_results_summary` - Precomputed statistics

## 📊 Evaluation Rubrics

### LLM-based Accuracy (0-1 scale)
Uses GPT-4 to judge correctness compared to expected output.

### LLM-based Quality (1-5 scale)
Uses GPT-4 to rate overall quality of the response.

### BLEU Score
Automated metric comparing n-gram overlap with expected output.

### ROUGE Score
Automated metric measuring recall-oriented overlap.

### Semantic Similarity
Cosine similarity of TF-IDF vectors.

### Keyword/Rule-based
Custom rules for keyword presence or regex patterns.

## 🔧 Configuration

### Worker Settings (worker/config.py)
- `POLL_INTERVAL` - Seconds between polling (default: 5)
- `BATCH_SIZE` - Items to process in parallel (default: 10)
- `MAX_RETRIES` - Retry attempts for failed items (default: 3)

### Custom Rubrics
Create custom evaluation prompts in the UI or define reusable rubrics in the database.

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Worker (Railway/Fly.io/Docker)
```bash
# Build Docker image
docker build -t eaas-worker ./worker

# Run container
docker run -d --env-file worker/.env eaas-worker
```

## 📝 Example Datasets

See `examples/` directory for sample CSV and JSON datasets.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## 📄 License

MIT

## 🙏 Acknowledgments

Built with:
- Next.js
- Supabase
- OpenAI API
- Recharts
- TailwindCSS
