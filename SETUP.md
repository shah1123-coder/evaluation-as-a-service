# EaaS Setup Guide

This guide walks you through setting up the Evaluation as a Service platform from scratch.

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- A Supabase account (free tier works)
- OpenAI API key (for LLM-based evaluations)
- Optional: Anthropic API key (for Claude-based evaluations)

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `eaas` (or your preferred name)
   - Database Password: (generate a strong password)
   - Region: (choose closest to you)
5. Click "Create new project"
6. Wait for the project to be provisioned (~2 minutes)

### 1.2 Run Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this repository
4. Paste into the SQL Editor
5. Click "Run" or press Cmd/Ctrl + Enter
6. Verify all tables were created successfully

### 1.3 Get API Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - ⚠️ Keep this secret!

## Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...  # Optional
```

### 2.3 Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the EaaS homepage!

## Step 3: Worker Setup

The worker processes evaluation jobs in the background.

### 3.1 Create Virtual Environment

```bash
cd worker
python -m venv venv
```

### 3.2 Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 3.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 3.4 Download NLTK Data

```bash
python -c "import nltk; nltk.download('punkt')"
```

### 3.5 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...  # Optional
```

### 3.6 Run Worker

```bash
python worker.py
```

You should see:
```
2024-01-15 10:00:00 - __main__ - INFO - Worker initialized
2024-01-15 10:00:00 - __main__ - INFO - Starting worker loop...
```

Keep this terminal running while using the application.

## Step 4: Test the System

### 4.1 Create Your First Evaluation

1. Open [http://localhost:3000/upload](http://localhost:3000/upload)
2. Enter evaluation name: "Test Evaluation"
3. Upload the sample dataset from `examples/sample_dataset.csv`
4. Select rubric: "LLM-based Accuracy"
5. Set threshold: 0.8
6. Click "Start Evaluation"

### 4.2 Monitor Progress

1. You'll be redirected to the evaluation page
2. The status should change from "pending" → "running" → "completed"
3. Watch the worker terminal for processing logs
4. Once complete, you'll see scores and explanations

### 4.3 View History

1. Navigate to [http://localhost:3000/history](http://localhost:3000/history)
2. You should see your evaluation listed
3. Click on it to view detailed results

## Step 5: Production Deployment

### 5.1 Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Project Settings → Environment Variables
```

### 5.2 Deploy Worker

**Option A: Railway**

1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Deploy from GitHub or Docker
4. Add environment variables
5. Deploy

**Option B: Fly.io**

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create Dockerfile in worker directory
cd worker
cat > Dockerfile << EOF
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN python -c "import nltk; nltk.download('punkt')"
COPY . .
CMD ["python", "worker.py"]
EOF

# Deploy
fly launch
fly secrets set SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx OPENAI_API_KEY=xxx
fly deploy
```

**Option C: Docker Compose (Self-hosted)**

```yaml
# docker-compose.yml
version: '3.8'
services:
  worker:
    build: ./worker
    env_file: ./worker/.env
    restart: unless-stopped
```

```bash
docker-compose up -d
```

## Troubleshooting

### Frontend Issues

**Error: "Failed to fetch evaluations"**
- Check that Supabase URL and keys are correct in `.env.local`
- Verify RLS policies are set up correctly
- Check browser console for detailed errors

**Error: "Module not found"**
- Run `npm install` again
- Delete `node_modules` and `.next`, then reinstall

### Worker Issues

**Error: "No module named 'supabase'"**
- Activate virtual environment
- Run `pip install -r requirements.txt`

**Error: "OpenAI API key not configured"**
- Add `OPENAI_API_KEY` to `worker/.env`
- Restart the worker

**Worker not processing jobs**
- Check that worker is running
- Verify Supabase credentials in `worker/.env`
- Check worker logs for errors
- Ensure evaluation status is "pending" in database

### Database Issues

**Error: "relation does not exist"**
- Run the SQL schema in Supabase SQL Editor
- Verify all tables were created

**Error: "permission denied"**
- Check RLS policies
- Verify you're using the service role key for the worker

## Next Steps

- Customize evaluation rubrics
- Create your own datasets
- Set up CI/CD integration
- Explore comparison and trend features

## Support

For issues and questions:
- Check the main README.md
- Review the PRD document
- Inspect browser console and worker logs

