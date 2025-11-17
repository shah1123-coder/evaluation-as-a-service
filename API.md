# EaaS API Documentation

This document describes the REST API endpoints for the Evaluation as a Service platform.

## Base URL

```
http://localhost:3000/api  (development)
https://your-domain.com/api  (production)
```

## Endpoints

### Create Evaluation

Create a new evaluation job.

**Endpoint:** `POST /evaluations/create`

**Request Body:**
```json
{
  "name": "GPT-4 Math Test",
  "rubric": {
    "type": "llm",
    "scale": "0-1",
    "prompt_template": "Rate the correctness..."
  },
  "threshold": 0.8,
  "model_version": "v1.0.0",
  "items": [
    {
      "prompt": "What is 2+2?",
      "expected_output": "4",
      "model_output": "4"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "evaluation_id": "uuid-here",
  "message": "Evaluation created with 1 items"
}
```

---

### Get Evaluation

Retrieve evaluation details and all items.

**Endpoint:** `GET /evaluations/[id]`

**Response:**
```json
{
  "evaluation": {
    "id": "uuid",
    "name": "GPT-4 Math Test",
    "status": "completed",
    "average_score": 0.95,
    "threshold": 0.8,
    "total_items": 10,
    "completed_items": 10,
    "created_at": "2024-01-15T10:00:00Z"
  },
  "items": [
    {
      "id": "uuid",
      "prompt": "What is 2+2?",
      "model_output": "4",
      "expected_output": "4",
      "score": 1.0,
      "explanation": "Correct answer",
      "status": "scored"
    }
  ]
}
```

---

### List Evaluations

Get all evaluations.

**Endpoint:** `GET /evaluations/list`

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "evaluations": [
    {
      "id": "uuid",
      "name": "GPT-4 Math Test",
      "status": "completed",
      "average_score": 0.95,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Get Evaluation Status

Check the status of an evaluation (useful for polling).

**Endpoint:** `GET /evaluations/status`

**Query Parameters:**
- `id` (required): Evaluation ID

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  "average_score": 0.95,
  "threshold": 0.8,
  "total_items": 10,
  "completed_items": 10,
  "passed": true
}
```

**Status Values:**
- `pending` - Waiting to be processed
- `running` - Currently being evaluated
- `completed` - All items scored
- `failed` - Error occurred

---

### Run Evaluation (CI/CD)

Trigger an evaluation run (designed for CI/CD pipelines).

**Endpoint:** `POST /evaluations/run`

**Request Body:**
```json
{
  "dataset_name": "CI Test Dataset",
  "model_version": "v1.0.0",
  "rubric_name": "accuracy",
  "threshold": 0.8,
  "items": [
    {
      "prompt": "What is 2+2?",
      "expected_output": "4",
      "model_output": "4"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "evaluation_id": "uuid",
  "status_url": "/api/evaluations/status?id=uuid",
  "message": "Evaluation job created successfully"
}
```

---

## Rubric Configuration

### LLM-based Rubric

```json
{
  "type": "llm",
  "scale": "0-1",
  "model": "gpt-4",
  "prompt_template": "You are a strict evaluator...\n\nPrompt: {prompt}\nExpected: {expected_output}\nModel Output: {model_output}\n\nRespond in JSON: {\"score\": <number>, \"explanation\": \"<text>\"}"
}
```

**Scale Options:**
- `0-1` - Decimal score from 0 to 1
- `1-5` - Integer score from 1 to 5
- `1-10` - Integer score from 1 to 10
- `yes-no` - Binary yes/no

**Model Options:**
- `gpt-4`
- `gpt-4-turbo`
- `gpt-3.5-turbo`
- `claude-3-opus`
- `claude-3-sonnet`

### BLEU Rubric

```json
{
  "type": "bleu",
  "metric_name": "bleu"
}
```

Requires `expected_output` in items.

### ROUGE Rubric

```json
{
  "type": "rouge",
  "metric_name": "rouge-l"
}
```

**Metric Options:**
- `rouge-1` - Unigram overlap
- `rouge-2` - Bigram overlap
- `rouge-l` - Longest common subsequence

Requires `expected_output` in items.

### Similarity Rubric

```json
{
  "type": "similarity"
}
```

Uses TF-IDF cosine similarity. Requires `expected_output` in items.

### Keyword/Rule-based Rubric

```json
{
  "type": "keyword",
  "rules": {
    "keywords": ["important", "key", "term"],
    "must_include": ["required phrase"],
    "must_not_include": ["forbidden word"]
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad request (missing/invalid parameters)
- `404` - Resource not found
- `500` - Internal server error

---

## CI/CD Integration Examples

### GitHub Actions

```yaml
- name: Run Evaluation
  run: |
    RESPONSE=$(curl -X POST ${{ secrets.EAAS_URL }}/api/evaluations/run \
      -H "Content-Type: application/json" \
      -d @evaluation_dataset.json)
    
    EVAL_ID=$(echo $RESPONSE | jq -r '.evaluation_id')
    echo "eval_id=$EVAL_ID" >> $GITHUB_OUTPUT

- name: Check Status
  run: |
    STATUS=$(curl "${{ secrets.EAAS_URL }}/api/evaluations/status?id=$EVAL_ID")
    PASSED=$(echo $STATUS | jq -r '.passed')
    
    if [ "$PASSED" = "false" ]; then
      exit 1
    fi
```

### cURL Examples

**Create evaluation:**
```bash
curl -X POST http://localhost:3000/api/evaluations/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "rubric": {"type": "llm", "scale": "0-1", "prompt_template": "..."},
    "items": [{"prompt": "...", "model_output": "..."}]
  }'
```

**Check status:**
```bash
curl "http://localhost:3000/api/evaluations/status?id=uuid-here"
```

**List evaluations:**
```bash
curl "http://localhost:3000/api/evaluations/list?limit=10"
```

---

## Rate Limits

Currently no rate limits are enforced. For production use, consider implementing:
- API key authentication
- Rate limiting per user/API key
- Request throttling

---

## Webhooks (Future)

Planned feature: Webhook notifications when evaluations complete.

```json
{
  "event": "evaluation.completed",
  "evaluation_id": "uuid",
  "status": "completed",
  "average_score": 0.95,
  "passed": true
}
```

