import json
import re
from typing import Dict, Any, Tuple
from openai import OpenAI
from anthropic import Anthropic
import nltk
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from rouge_score import rouge_scorer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from config import OPENAI_API_KEY, ANTHROPIC_API_KEY

# Download NLTK data if needed
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class LLMScorer:
    """Score using LLM as a judge (GPT-4 or Claude)"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
        self.anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None
    
    def score(self, rubric: Dict[str, Any], prompt: str, model_output: str, expected_output: str = None) -> Tuple[float, str]:
        """
        Score using LLM judge
        Returns: (score, explanation)
        """
        prompt_template = rubric.get('prompt_template', '')
        scale = rubric.get('scale', '0-1')
        model = rubric.get('model', 'gpt-4')
        
        # Fill in template
        eval_prompt = prompt_template.format(
            prompt=prompt,
            model_output=model_output,
            expected_output=expected_output or 'N/A'
        )
        
        try:
            if model.startswith('gpt') and self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are an evaluation assistant. Always respond in JSON format."},
                        {"role": "user", "content": eval_prompt}
                    ],
                    temperature=0.0,
                    max_tokens=500
                )
                result_text = response.choices[0].message.content
            elif model.startswith('claude') and self.anthropic_client:
                response = self.anthropic_client.messages.create(
                    model=model,
                    max_tokens=500,
                    temperature=0.0,
                    messages=[
                        {"role": "user", "content": eval_prompt}
                    ]
                )
                result_text = response.content[0].text
            else:
                # Default to GPT-4
                if not self.openai_client:
                    raise ValueError("OpenAI API key not configured")
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are an evaluation assistant. Always respond in JSON format."},
                        {"role": "user", "content": eval_prompt}
                    ],
                    temperature=0.0,
                    max_tokens=500
                )
                result_text = response.choices[0].message.content
            
            # Parse JSON response
            result = self._parse_json_response(result_text)
            score = float(result.get('score', 0))
            explanation = result.get('explanation', result_text)
            
            # Normalize score to 0-1 range
            score = self._normalize_score(score, scale)
            
            return score, explanation
            
        except Exception as e:
            raise Exception(f"LLM scoring failed: {str(e)}")
    
    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """Extract JSON from response text"""
        # Try to find JSON in the response
        json_match = re.search(r'\{[^}]+\}', text)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # If no JSON found, try to parse the whole text
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Return a default structure
            return {'score': 0, 'explanation': text}
    
    def _normalize_score(self, score: float, scale: str) -> float:
        """Normalize score to 0-1 range"""
        if scale == '0-1':
            return max(0.0, min(1.0, score))
        elif scale == '1-5':
            return max(0.0, min(1.0, (score - 1) / 4))
        elif scale == '1-10':
            return max(0.0, min(1.0, (score - 1) / 9))
        elif scale == 'yes-no':
            return 1.0 if score > 0.5 else 0.0
        else:
            return max(0.0, min(1.0, score))


class BLEUScorer:
    """Score using BLEU metric"""
    
    def score(self, rubric: Dict[str, Any], prompt: str, model_output: str, expected_output: str = None) -> Tuple[float, str]:
        """
        Calculate BLEU score
        Returns: (score, explanation)
        """
        if not expected_output:
            raise ValueError("BLEU scoring requires expected_output")
        
        # Tokenize
        reference = nltk.word_tokenize(expected_output.lower())
        candidate = nltk.word_tokenize(model_output.lower())
        
        # Calculate BLEU with smoothing
        smoothing = SmoothingFunction().method1
        score = sentence_bleu([reference], candidate, smoothing_function=smoothing)
        
        explanation = f"BLEU score comparing model output to expected output"
        
        return score, explanation


class ROUGEScorer:
    """Score using ROUGE metric"""
    
    def __init__(self):
        self.scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    
    def score(self, rubric: Dict[str, Any], prompt: str, model_output: str, expected_output: str = None) -> Tuple[float, str]:
        """
        Calculate ROUGE score
        Returns: (score, explanation)
        """
        if not expected_output:
            raise ValueError("ROUGE scoring requires expected_output")
        
        metric_name = rubric.get('metric_name', 'rougeL')
        scores = self.scorer.score(expected_output, model_output)
        
        # Get F1 score for the specified metric
        score = scores[metric_name].fmeasure
        
        explanation = f"{metric_name.upper()} F1 score: {score:.3f}"
        
        return score, explanation


class SimilarityScorer:
    """Score using cosine similarity of TF-IDF vectors"""
    
    def score(self, rubric: Dict[str, Any], prompt: str, model_output: str, expected_output: str = None) -> Tuple[float, str]:
        """
        Calculate semantic similarity
        Returns: (score, explanation)
        """
        if not expected_output:
            raise ValueError("Similarity scoring requires expected_output")
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([expected_output, model_output])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        
        explanation = f"Cosine similarity between expected and model output: {similarity:.3f}"
        
        return similarity, explanation


class KeywordScorer:
    """Score based on keyword presence"""
    
    def score(self, rubric: Dict[str, Any], prompt: str, model_output: str, expected_output: str = None) -> Tuple[float, str]:
        """
        Score based on keyword rules
        Returns: (score, explanation)
        """
        rules = rubric.get('rules', {})
        keywords = rules.get('keywords', [])
        must_include = rules.get('must_include', [])
        must_not_include = rules.get('must_not_include', [])
        
        model_output_lower = model_output.lower()
        
        # Check must_include
        missing = [kw for kw in must_include if kw.lower() not in model_output_lower]
        if missing:
            return 0.0, f"Missing required keywords: {', '.join(missing)}"
        
        # Check must_not_include
        forbidden = [kw for kw in must_not_include if kw.lower() in model_output_lower]
        if forbidden:
            return 0.0, f"Contains forbidden keywords: {', '.join(forbidden)}"
        
        # Count keyword matches
        if keywords:
            matches = sum(1 for kw in keywords if kw.lower() in model_output_lower)
            score = matches / len(keywords)
            explanation = f"Matched {matches}/{len(keywords)} keywords"
        else:
            score = 1.0
            explanation = "All rules passed"
        
        return score, explanation


def get_scorer(rubric_type: str):
    """Factory function to get the appropriate scorer"""
    scorers = {
        'llm': LLMScorer(),
        'bleu': BLEUScorer(),
        'rouge': ROUGEScorer(),
        'similarity': SimilarityScorer(),
        'keyword': KeywordScorer(),
        'rule_based': KeywordScorer(),
    }
    
    scorer = scorers.get(rubric_type)
    if not scorer:
        raise ValueError(f"Unknown rubric type: {rubric_type}")
    
    return scorer

