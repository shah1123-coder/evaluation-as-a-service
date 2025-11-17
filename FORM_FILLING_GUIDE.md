# Form Filling Guide - Upload Page

This guide shows you exactly what to fill in each field on the `/upload` page.

## 📝 Upload Form Fields

### 1. Evaluation Name *
**What it is:** A descriptive name for this evaluation run

**Examples:**
- `QA Model Test - v1.0`
- `GPT-4 Factual Accuracy Test`
- `Baseline Evaluation`
- `Production Model - Jan 2024`

**What to use for testing:**
```
QA Model Test
```

---

### 2. Model Version (Optional)
**What it is:** Version identifier for tracking which model you're testing

**Examples:**
- `gpt-4-0125-preview`
- `v1.0.0`
- `2024-01-15`
- `baseline`
- `prod-v2.3`

**What to use for testing:**
```
v1.0.0
```

Or just leave it **blank** - it's optional!

---

### 3. Upload Dataset *
**What it is:** Your CSV or JSON file with test cases

**For testing, use one of these files:**
- ✅ `mockevaluations_upload.json` (recommended)
- ✅ `mockevaluations.csv`
- ✅ `examples/sample_dataset.json`
- ✅ `examples/sample_dataset.csv`

**How to upload:**
1. Click the upload area OR drag and drop
2. Select the file
3. ✅ You should see "✓ 10 items loaded" (or however many items are in your file)

---

### 4. Select Evaluation Rubric *

**Choose one of these:**

#### Option A: BLEU Score ✅ **RECOMMENDED FOR TESTING**
- **Needs API Key?** ❌ NO
- **Cost:** Free
- **Speed:** Fast
- **Good for:** Exact matches, translations
- **No configuration needed!**

#### Option B: ROUGE Score ✅ **ALSO GOOD FOR TESTING**
- **Needs API Key?** ❌ NO
- **Cost:** Free
- **Speed:** Fast
- **Good for:** Summarization, paraphrases
- **No configuration needed!**

#### Option C: Semantic Similarity ✅ **ALSO FREE**
- **Needs API Key?** ❌ NO
- **Cost:** Free
- **Speed:** Fast
- **Good for:** Meaning-based comparison
- **No configuration needed!**

#### Option D: LLM-based Accuracy ⚠️ **NEEDS API KEY**
- **Needs API Key?** ✅ YES (OpenAI)
- **Cost:** ~$0.01-0.10 per evaluation
- **Speed:** Slower (API calls)
- **Good for:** Complex evaluation, explanations
- **Configuration required:** See below

#### Option E: LLM-based Quality ⚠️ **NEEDS API KEY**
- **Needs API Key?** ✅ YES (OpenAI)
- **Cost:** ~$0.01-0.10 per evaluation
- **Speed:** Slower (API calls)
- **Good for:** Quality assessment
- **Configuration required:** See below

---

### 5. Custom Prompt Template (Only for LLM-based rubrics)

**When to fill this:** Only if you selected "LLM-based Accuracy" or "LLM-based Quality"

**What to paste:**

```
You are evaluating the factual accuracy of a model's response.

Prompt: {prompt}
Expected Output: {expected_output}
Model Output: {model_output}

Rate the factual accuracy on a scale of 0-1, where 1 is completely accurate and 0 is completely inaccurate.

Respond in JSON format:
{"score": <number between 0 and 1>, "explanation": "<brief explanation>"}
```

**Available placeholders:**
- `{prompt}` - The question/prompt
- `{expected_output}` - The correct answer
- `{model_output}` - The model's response

**Other template examples:**

**For Quality (1-5 scale):**
```
Evaluate the quality of this response on a scale of 1-5.

Prompt: {prompt}
Model Output: {model_output}

Consider accuracy, completeness, clarity, and helpfulness.

Respond in JSON format:
{"score": <number 1-5>, "explanation": "<brief explanation>"}
```

**For Yes/No:**
```
Is this response correct?

Prompt: {prompt}
Expected: {expected_output}
Actual: {model_output}

Respond in JSON format:
{"score": "yes" or "no", "explanation": "<brief explanation>"}
```

---

### 6. Model Selection (Only for LLM-based rubrics)

**When to fill this:** Only if you selected "LLM-based Accuracy" or "LLM-based Quality"

**Options:**
- `gpt-4` (recommended - most accurate)
- `gpt-4-turbo` (faster, cheaper)
- `gpt-3.5-turbo` (fastest, cheapest)
- `claude-3-opus` (requires Anthropic API key)
- `claude-3-sonnet` (requires Anthropic API key)

**What to use for testing:**
```
gpt-4
```

---

### 7. Threshold (Optional)
**What it is:** Minimum average score to "pass" the evaluation

**Examples:**
- `0.7` (70% - common for production)
- `0.8` (80% - strict)
- `0.5` (50% - lenient)
- `0.9` (90% - very strict)

**What to use for testing:**
```
0.7
```

**What happens:**
- If average score ≥ threshold → ✅ PASSED
- If average score < threshold → ❌ FAILED

Leave **blank** if you don't want pass/fail checking.

---

## 🎯 Complete Example - Quick Test (No API Key)

Here's what to fill in for a quick test **without needing any API keys:**

```
Evaluation Name: QA Model Test
Model Version: v1.0.0
Upload Dataset: [drag and drop mockevaluations_upload.json]
Select Rubric: BLEU Score
Threshold: 0.7
```

Click **"Start Evaluation"** → Done! ✅

---

## 🎯 Complete Example - With LLM (Needs OpenAI API Key)

If you have an OpenAI API key and want to use LLM-based evaluation:

```
Evaluation Name: QA Model Test - LLM
Model Version: v1.0.0
Upload Dataset: [drag and drop mockevaluations_upload.json]
Select Rubric: LLM-based Accuracy
Custom Prompt Template: [paste the template from section 5 above]
Model: gpt-4
Threshold: 0.7
```

Click **"Start Evaluation"** → Done! ✅

---

## ❓ FAQ

### Q: Which rubric should I use for testing?
**A:** Use **BLEU Score** - it's free, fast, and doesn't need API keys!

### Q: Do I need to fill in Model Version?
**A:** No, it's optional. It's just for tracking.

### Q: What if I don't have an OpenAI API key?
**A:** Use BLEU, ROUGE, or Semantic Similarity rubrics - they're free!

### Q: Can I leave Threshold blank?
**A:** Yes! It's optional. If blank, there's no pass/fail, just scores.

### Q: What's the difference between BLEU and ROUGE?
**A:** 
- **BLEU:** Better for exact matches (translations, factual answers)
- **ROUGE:** Better for summarization and paraphrases

### Q: How do I get an OpenAI API key?
**A:** 
1. Go to https://platform.openai.com/api-keys
2. Sign up / log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. Add to `.env.local` as `OPENAI_API_KEY=sk-...`
6. Restart dev server

---

## 🚀 Quick Start Checklist

- [ ] Supabase configured (see SETUP_INSTRUCTIONS.md)
- [ ] Dev server running (`npm run dev`)
- [ ] Go to http://localhost:3000/upload
- [ ] Fill in form:
  - [ ] Evaluation Name: `QA Model Test`
  - [ ] Model Version: `v1.0.0` (or blank)
  - [ ] Upload: `mockevaluations_upload.json`
  - [ ] Rubric: `BLEU Score`
  - [ ] Threshold: `0.7`
- [ ] Click "Start Evaluation"
- [ ] ✅ See results!

---

## Summary

**Minimum required fields:**
1. Evaluation Name
2. Upload Dataset
3. Select Rubric

**For testing without API keys:**
- Use BLEU, ROUGE, or Semantic Similarity rubrics
- No custom prompt needed
- No model selection needed

**For LLM-based rubrics:**
- Need OpenAI or Anthropic API key
- Need to fill custom prompt template
- Need to select model

**Start with BLEU Score for easiest testing!** 🎯

