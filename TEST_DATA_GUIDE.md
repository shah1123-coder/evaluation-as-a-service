# Test Data Guide

This guide explains the different test dataset files and how to use them.

## 📁 Available Test Files

### 1. `mockevaluations_upload.json` ✅ **USE THIS FOR UI UPLOAD**

**Purpose:** Upload via the web interface at `/upload`

**Format:** Array of items only
```json
[
  {
    "prompt": "What is the capital of France?",
    "expected_output": "The capital of France is Paris.",
    "model_output": "Paris is the capital of France."
  },
  ...
]
```

**How to use:**
1. Go to http://localhost:3000/upload
2. Enter evaluation name: "QA Model Test"
3. Drag and drop `mockevaluations_upload.json`
4. Select a rubric (e.g., "LLM-based Accuracy")
5. Set threshold: 0.7
6. Click "Start Evaluation"

---

### 2. `mockevaluations.csv` ✅ **USE THIS FOR CSV UPLOAD**

**Purpose:** Upload via the web interface (CSV format)

**Format:** CSV with headers
```csv
prompt,expected_output,model_output
"Question","Expected answer","Model's answer"
```

**How to use:**
1. Go to http://localhost:3000/upload
2. Enter evaluation name: "QA Model Test CSV"
3. Drag and drop `mockevaluations.csv`
4. Select a rubric
5. Set threshold: 0.7
6. Click "Start Evaluation"

---

### 3. `mockevaluations_api.json` ✅ **USE THIS FOR API TESTING**

**Purpose:** Direct API calls (for CI/CD or programmatic testing)

**Format:** Complete evaluation request with metadata
```json
{
  "name": "QA Model Evaluation - v1.0",
  "rubric": {
    "type": "llm",
    "model": "gpt-4",
    "scale": "0-1",
    "prompt_template": "..."
  },
  "threshold": 0.7,
  "model_version": "gpt-4-0125-preview",
  "items": [...]
}
```

**How to use:**
```bash
curl -X POST http://localhost:3000/api/evaluations/create \
  -H "Content-Type: application/json" \
  -d @mockevaluations_api.json
```

---

### 4. `mockevaluations.json` ❌ **ORIGINAL FILE - HAS ISSUES**

**Status:** This file has structural issues and won't work with the current system.

**Issues:**
- Rubric structure doesn't match expected format
- Missing required `type` field in rubric
- Has extra metadata fields that aren't used

**Recommendation:** Use `mockevaluations_upload.json` or `mockevaluations_api.json` instead.

---

## 🎯 Test Dataset Content

All test files contain **10 factual questions** with intentional errors to test evaluation:

| # | Question | Expected | Model Output | Correctness |
|---|----------|----------|--------------|-------------|
| 1 | Capital of France | Paris | Paris | ✅ Correct |
| 2 | Author of To Kill a Mockingbird | Harper Lee | Harper Lee | ✅ Correct |
| 3 | Chemical formula for water | H₂O | H2O | ✅ Correct (minor formatting) |
| 4 | Declaration of Independence date | July 4, 1776 | 1776 | ⚠️ Incomplete |
| 5 | Largest planet | Jupiter | Saturn | ❌ Wrong |
| 6 | Mona Lisa painter | Leonardo da Vinci | Vincent van Gogh | ❌ Wrong |
| 7 | Speed of light | 299,792 km/s | ~300,000 km/s | ✅ Approximately correct |
| 8 | Sun's composition | Hydrogen & Helium | Hydrogen & Helium | ✅ Correct |
| 9 | Largest ocean | Pacific | Atlantic | ❌ Wrong |
| 10 | Theory of relativity | Einstein | Einstein | ✅ Correct |

**Expected Results:**
- **Correct answers:** 6-7 out of 10
- **Expected average score:** ~0.65-0.75 (depending on rubric)
- **With threshold 0.7:** Should be borderline pass/fail

---

## 🧪 Testing Scenarios

### Scenario 1: UI Upload Test (Easiest)

**File:** `mockevaluations_upload.json` or `mockevaluations.csv`

**Steps:**
1. Open http://localhost:3000/upload
2. Upload the file
3. Configure evaluation settings
4. Submit and watch results

**Expected outcome:** Evaluation created, items loaded, ready for scoring

---

### Scenario 2: API Test (Advanced)

**File:** `mockevaluations_api.json`

**Steps:**
```bash
# Create evaluation
curl -X POST http://localhost:3000/api/evaluations/create \
  -H "Content-Type: application/json" \
  -d @mockevaluations_api.json

# Get the evaluation_id from response
# Then check status
curl "http://localhost:3000/api/evaluations/status?id=<evaluation_id>"
```

**Expected outcome:** Evaluation created via API, can view in UI

---

### Scenario 3: Different Rubrics

Test the same dataset with different evaluation methods:

**LLM-based (requires OpenAI API key):**
- Most accurate
- Provides explanations
- Slower and costs money

**BLEU Score (free, fast):**
- Automated metric
- No API key needed
- Good for exact matches

**ROUGE Score (free, fast):**
- Automated metric
- Good for summarization
- No API key needed

**Semantic Similarity (free, fast):**
- TF-IDF based
- No API key needed
- Captures meaning

---

## 📊 Expected Scores by Rubric

### LLM-based Accuracy (0-1 scale)
- Items 1, 2, 3, 7, 8, 10: ~0.9-1.0
- Item 4: ~0.5-0.7 (incomplete)
- Items 5, 6, 9: ~0.0-0.2 (wrong)
- **Average: ~0.65-0.75**

### BLEU Score
- Exact matches: High scores
- Paraphrases: Lower scores
- Wrong answers: Very low scores
- **Average: ~0.4-0.6**

### ROUGE Score
- Similar to BLEU
- Focuses on recall
- **Average: ~0.5-0.7**

### Semantic Similarity
- Captures meaning better than BLEU
- Paraphrases score higher
- **Average: ~0.6-0.8**

---

## 🔧 Troubleshooting

### "Failed to parse JSON"
- Make sure you're using `mockevaluations_upload.json` for UI upload
- Check that the file is valid JSON

### "Missing required fields"
- For UI upload: Use array format (upload file)
- For API: Use complete format (api file)

### "Rubric configuration invalid"
- Make sure rubric has `type` field
- For LLM: Include `scale` and `prompt_template`
- For metrics: Include `metric_name` if needed

### File won't upload
- Check file extension (.json or .csv)
- Verify file size is reasonable
- Check browser console for errors

---

## 📝 Creating Your Own Test Data

### JSON Format (for upload):
```json
[
  {
    "prompt": "Your question",
    "expected_output": "Expected answer (optional for some rubrics)",
    "model_output": "Model's actual answer"
  }
]
```

### CSV Format:
```csv
prompt,expected_output,model_output
"Question 1","Expected 1","Output 1"
"Question 2","Expected 2","Output 2"
```

**Tips:**
- Include both correct and incorrect answers
- Test edge cases (incomplete answers, paraphrases)
- Use 10-50 items for meaningful statistics
- Set threshold based on expected performance

---

## 🎯 Quick Test Commands

**Test with CSV:**
```bash
# Just open the UI and drag mockevaluations.csv
open http://localhost:3000/upload
```

**Test with JSON (UI):**
```bash
# Drag mockevaluations_upload.json in the UI
open http://localhost:3000/upload
```

**Test with API:**
```bash
curl -X POST http://localhost:3000/api/evaluations/create \
  -H "Content-Type: application/json" \
  -d @mockevaluations_api.json
```

---

## Summary

✅ **For UI testing:** Use `mockevaluations_upload.json` or `mockevaluations.csv`  
✅ **For API testing:** Use `mockevaluations_api.json`  
❌ **Don't use:** `mockevaluations.json` (has structural issues)

All files contain the same 10 test questions with intentional errors to verify the evaluation system works correctly!

