# Quick Setup Instructions

## Current Error

You're seeing: **"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"**

**Cause:** Supabase is not configured. The API is returning an error page (HTML) instead of JSON.

## Fix: Configure Supabase (10 minutes)

### Step 1: Create Supabase Account (2 min)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### Step 2: Create New Project (2 min)

1. Click "New Project"
2. Fill in:
   - **Name:** `eaas`
   - **Database Password:** (generate and save it!)
   - **Region:** Choose closest to you (e.g., US West, EU Central)
   - **Pricing Plan:** Free
3. Click "Create new project"
4. ⏳ Wait ~2 minutes for provisioning

### Step 3: Run Database Schema (2 min)

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` from this project
4. Copy the ENTIRE contents (all ~200 lines)
5. Paste into the SQL Editor
6. Click **"Run"** or press Cmd/Ctrl + Enter
7. ✅ You should see "Success. No rows returned"

### Step 4: Get API Credentials (1 min)

1. In Supabase dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** in the settings menu
3. Copy these 3 values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key:** (starts with `eyJ...`)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **service_role key:** (starts with `eyJ...`) ⚠️ Keep this secret!
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 5: Update Environment Variables (2 min)

1. Open `.env.local` in your code editor
2. Replace the placeholder values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI API Key (OPTIONAL - only needed for LLM-based rubrics)
OPENAI_API_KEY=your-openai-api-key

# Anthropic API Key (OPTIONAL)
ANTHROPIC_API_KEY=your-anthropic-api-key
```

3. Save the file

### Step 6: Restart Dev Server (1 min)

1. Go to the terminal running `npm run dev`
2. Press **Ctrl+C** to stop it
3. Run `npm run dev` again
4. ✅ The error should be gone!

---

## Testing Without API Keys

You can test the platform **without OpenAI/Anthropic API keys** by using free rubrics:

### ✅ Free Rubrics (No API Key Needed)

1. **BLEU Score**
   - Automated metric
   - Compares n-gram overlap
   - Good for exact matches

2. **ROUGE Score**
   - Automated metric
   - Good for summarization
   - Multiple variants (ROUGE-1, ROUGE-2, ROUGE-L)

3. **Semantic Similarity**
   - TF-IDF cosine similarity
   - Captures meaning
   - No API calls

### ❌ Paid Rubrics (Need API Key)

1. **LLM-based Accuracy** - Needs OpenAI or Anthropic
2. **LLM-based Quality** - Needs OpenAI or Anthropic

---

## How to Upload Your Test File

Once Supabase is configured:

1. Go to http://localhost:3000/upload
2. Fill in the form:
   - **Evaluation Name:** `QA Model Test`
   - **Model Version:** `v1.0.0` (or leave blank)
   - **Upload Dataset:** Drag and drop `mockevaluations_upload.json`
   - **Select Rubric:** Choose **"BLEU Score"** (free, no API key needed!)
   - **Threshold:** `0.7`
3. Click **"Start Evaluation"**

---

## Custom Prompt Template Examples

If you want to use LLM-based rubrics (requires API key), here are some templates:

### Factual Accuracy (0-1 scale)
```
You are evaluating the factual accuracy of a model's response.

Prompt: {prompt}
Expected Output: {expected_output}
Model Output: {model_output}

Rate the factual accuracy on a scale of 0-1, where 1 is completely accurate and 0 is completely inaccurate.

Respond in JSON format:
{"score": <number between 0 and 1>, "explanation": "<brief explanation>"}
```

### Response Quality (1-5 scale)
```
Evaluate the quality of this response on a scale of 1-5.

Prompt: {prompt}
Model Output: {model_output}

Consider:
- Accuracy
- Completeness
- Clarity
- Helpfulness

Respond in JSON format:
{"score": <number 1-5>, "explanation": "<brief explanation>"}
```

### Helpfulness (yes/no)
```
Is this response helpful and accurate?

Prompt: {prompt}
Expected Output: {expected_output}
Model Output: {model_output}

Respond in JSON format:
{"score": "yes" or "no", "explanation": "<brief explanation>"}
```

---

## Troubleshooting

### Still seeing "Unexpected token" error?
1. Make sure you saved `.env.local`
2. Restart the dev server (Ctrl+C, then `npm run dev`)
3. Check that Supabase URL starts with `https://`
4. Verify you copied the full API keys (they're very long!)

### "Failed to create evaluation"?
1. Make sure you ran the database schema in Supabase SQL Editor
2. Check that all 4 tables were created (evaluations, evaluation_items, rubrics, evaluation_results_summary)

### Want to use LLM rubrics?
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add it to `.env.local` as `OPENAI_API_KEY=sk-...`
3. Restart dev server
4. Now you can use "LLM-based Accuracy" and "LLM-based Quality" rubrics

---

## Summary

✅ **To fix the error:** Set up Supabase (10 minutes)  
✅ **To test without API keys:** Use BLEU or ROUGE rubrics  
✅ **To use LLM rubrics:** Get OpenAI API key (optional)  

**Next:** Follow Step 1-6 above to configure Supabase!

