# EaaS Worker

The worker is responsible for processing evaluation jobs from the queue.

## Features

- Polls Supabase for pending evaluations
- Processes items using configured rubrics
- Supports multiple scoring methods:
  - LLM-based (GPT-4, Claude)
  - BLEU score
  - ROUGE score
  - Semantic similarity
  - Keyword/rule-based
- Automatic retries with exponential backoff
- Error handling and logging

## Setup

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt')"

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run worker
python worker.py
```

### Docker

```bash
# Build image
docker build -t eaas-worker .

# Run container
docker run -d --env-file .env eaas-worker
```

### Docker Compose

```yaml
version: '3.8'
services:
  worker:
    build: .
    env_file: .env
    restart: unless-stopped
```

```bash
docker-compose up -d
```

## Configuration

Edit `config.py` to adjust:

- `POLL_INTERVAL` - Seconds between polling (default: 5)
- `BATCH_SIZE` - Items to process in parallel (default: 10)
- `MAX_RETRIES` - Retry attempts for failed items (default: 3)

## Environment Variables

Required:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (bypasses RLS)
- `OPENAI_API_KEY` - OpenAI API key (for LLM-based evaluations)

Optional:
- `ANTHROPIC_API_KEY` - Anthropic API key (for Claude-based evaluations)

## Architecture

```
worker.py           # Main worker loop
├── database.py     # Supabase client and queries
├── scorers.py      # Scoring implementations
└── config.py       # Configuration
```

## Scoring Methods

### LLM-based Scoring

Uses GPT-4 or Claude to evaluate outputs based on a custom prompt template.

**Pros:**
- Flexible and customizable
- Can evaluate complex criteria
- Natural language explanations

**Cons:**
- Slower (API calls)
- Costs money per evaluation
- May have rate limits

### BLEU Score

Automated metric comparing n-gram overlap with expected output.

**Pros:**
- Fast and free
- Deterministic
- Good for translation tasks

**Cons:**
- Requires expected output
- Not suitable for creative tasks
- Doesn't understand semantics

### ROUGE Score

Automated metric measuring recall-oriented overlap.

**Pros:**
- Fast and free
- Good for summarization tasks
- Multiple variants (ROUGE-1, ROUGE-2, ROUGE-L)

**Cons:**
- Requires expected output
- Focuses on recall over precision

### Semantic Similarity

Cosine similarity of TF-IDF vectors.

**Pros:**
- Fast and free
- Captures semantic meaning
- No API calls needed

**Cons:**
- Requires expected output
- Simple TF-IDF may miss nuances
- Not as sophisticated as embeddings

### Keyword/Rule-based

Custom rules for keyword presence or regex patterns.

**Pros:**
- Very fast
- Deterministic
- No API calls or expected output needed

**Cons:**
- Limited to simple checks
- Brittle (exact matching)
- Doesn't understand context

## Monitoring

The worker logs all activity to stdout:

```
2024-01-15 10:00:00 - __main__ - INFO - Worker initialized
2024-01-15 10:00:05 - __main__ - INFO - Found 1 pending evaluation(s)
2024-01-15 10:00:05 - __main__ - INFO - Processing evaluation: Test (uuid)
2024-01-15 10:00:05 - __main__ - INFO - Processing 10 items
2024-01-15 10:00:15 - __main__ - INFO - Evaluation uuid completed: 10/10 items scored, average score: 0.950
```

## Error Handling

The worker handles errors gracefully:

1. **Item-level errors**: Retries up to `MAX_RETRIES` times with exponential backoff
2. **Evaluation-level errors**: Marks evaluation as "failed" and continues
3. **Worker-level errors**: Logs error and continues polling

Failed items are marked with status "error" and include an error message.

## Scaling

For high-volume workloads:

1. **Horizontal scaling**: Run multiple worker instances
2. **Batch processing**: Increase `BATCH_SIZE` in config
3. **Queue system**: Replace polling with Redis/RabbitMQ
4. **Async processing**: Use asyncio for parallel API calls

## Troubleshooting

**Worker not processing jobs:**
- Check that evaluations have status "pending"
- Verify Supabase credentials
- Check worker logs for errors

**LLM scoring fails:**
- Verify OpenAI/Anthropic API key
- Check API rate limits
- Ensure prompt template is valid

**BLEU/ROUGE scoring fails:**
- Verify items have `expected_output`
- Check NLTK data is downloaded

**High memory usage:**
- Reduce `BATCH_SIZE`
- Process items sequentially
- Restart worker periodically

