# EaaS Quick Start Guide

Get the Evaluation as a Service platform running in under 10 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.10+ installed (`python --version`)
- [ ] Supabase account created
- [ ] OpenAI API key obtained

## Step 1: Database Setup (3 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: `eaas`
   - Wait for provisioning (~2 min)

2. **Run Database Schema**
   - In Supabase dashboard → SQL Editor
   - Copy entire contents of `supabase-schema.sql`
   - Paste and click "Run"
   - ✅ Should see "Success. No rows returned"

3. **Get API Keys**
   - Go to Settings → API
   - Copy these values:
     - Project URL
     - anon public key
     - service_role key

## Step 2: Frontend Setup (2 minutes)

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# (Use your favorite editor: nano, vim, code, etc.)
nano .env.local
```

Add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
```

```bash
# Start development server
npm run dev
```

✅ Open [http://localhost:3000](http://localhost:3000) - you should see the EaaS homepage!

## Step 3: Worker Setup (3 minutes)

**In a new terminal:**

```bash
# Navigate to worker directory
cd worker

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt')"

# Create environment file
cp .env.example .env

# Edit .env with same credentials
nano .env
```

Add your credentials:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
```

```bash
# Start worker
python worker.py
```

✅ You should see:
```
INFO - Worker initialized
INFO - Starting worker loop...
```

## Step 4: Test the System (2 minutes)

1. **Upload Sample Dataset**
   - Go to [http://localhost:3000/upload](http://localhost:3000/upload)
   - Enter name: "Test Evaluation"
   - Click the upload area
   - Select `examples/sample_dataset.csv`
   - ✅ Should see "✓ 10 items loaded"

2. **Configure Evaluation**
   - Rubric: Keep "LLM-based Accuracy" selected
   - Threshold: Enter `0.8`
   - Click "Start Evaluation"

3. **Watch It Run**
   - You'll be redirected to the results page
   - Status will change: pending → running → completed
   - Watch the worker terminal for logs
   - After ~30 seconds, you'll see scores!

4. **Explore Results**
   - View individual scores and explanations
   - Download results as CSV
   - Go to [http://localhost:3000/history](http://localhost:3000/history)
   - See your evaluation in the list
   - View the trend chart

## 🎉 Success!

You now have a fully functional LLM evaluation platform!

## What to Try Next

### 1. Try Different Rubrics

**BLEU Score (fast, free):**
- Upload `examples/sample_dataset.csv`
- Select "BLEU Score" rubric
- No API calls needed!

**Keyword Matching:**
- Create a custom dataset
- Select "Keyword/Rule-based"
- Customize the prompt template

### 2. Compare Evaluations

- Create two evaluations with different rubrics
- Go to `/compare?eval1=<id1>&eval2=<id2>`
- See side-by-side comparison

### 3. Test CI/CD Integration

```bash
# Create a test dataset
cat > test_dataset.json << EOF
[
  {
    "prompt": "What is 2+2?",
    "expected_output": "4",
    "model_output": "4"
  }
]
EOF

# Trigger evaluation via API
curl -X POST http://localhost:3000/api/evaluations/run \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_name": "API Test",
    "model_version": "v1.0.0",
    "threshold": 0.8,
    "items": '$(cat test_dataset.json)'
  }'

# Get the evaluation_id from response, then check status
curl "http://localhost:3000/api/evaluations/status?id=<evaluation_id>"
```

### 4. Create Custom Datasets

**CSV Format:**
```csv
prompt,expected_output,model_output
"Your question","Expected answer","Model's answer"
```

**JSON Format:**
```json
[
  {
    "prompt": "Your question",
    "expected_output": "Expected answer",
    "model_output": "Model's answer"
  }
]
```

## Troubleshooting

### Frontend won't start
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Worker not processing
- Check that worker is running (see terminal)
- Verify `.env` has correct Supabase credentials
- Check evaluation status is "pending" in database
- Look for errors in worker terminal

### "Failed to fetch evaluations"
- Check `.env.local` has correct Supabase URL and keys
- Verify database schema was created successfully
- Check browser console for detailed errors

### LLM scoring fails
- Verify OpenAI API key is valid
- Check you have API credits
- Try a different rubric (BLEU, ROUGE) to test without API

## Common Issues

**"Module not found" errors:**
```bash
# Frontend
npm install

# Worker
cd worker
pip install -r requirements.txt
```

**"Permission denied" on database:**
- Make sure you're using the service_role key in worker
- Check RLS policies in Supabase

**Worker stops processing:**
- Check for errors in terminal
- Restart worker: `python worker.py`
- Verify API keys are valid

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [SETUP.md](SETUP.md) for production deployment
- Review [API.md](API.md) for API integration
- See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for architecture overview

## Need Help?

1. Check the documentation files
2. Review worker logs for errors
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**Estimated Total Time: 10 minutes**

✅ Database setup: 3 min  
✅ Frontend setup: 2 min  
✅ Worker setup: 3 min  
✅ Testing: 2 min  

Happy evaluating! 🚀

