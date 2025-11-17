#!/usr/bin/env python3
"""
EaaS Worker - Processes evaluation jobs from the queue
"""

import time
import logging
from typing import Dict, Any
from database import Database
from scorers import get_scorer
from config import POLL_INTERVAL, MAX_RETRIES

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class EvaluationWorker:
    def __init__(self):
        self.db = Database()
        logger.info("Worker initialized")
    
    def run(self):
        """Main worker loop"""
        logger.info("Starting worker loop...")
        
        while True:
            try:
                # Fetch pending evaluations
                evaluations = self.db.get_pending_evaluations()
                
                if evaluations:
                    logger.info(f"Found {len(evaluations)} pending evaluation(s)")
                    
                    for evaluation in evaluations:
                        self.process_evaluation(evaluation)
                else:
                    logger.debug("No pending evaluations")
                
                # Wait before next poll
                time.sleep(POLL_INTERVAL)
                
            except KeyboardInterrupt:
                logger.info("Worker stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in worker loop: {e}", exc_info=True)
                time.sleep(POLL_INTERVAL)
    
    def process_evaluation(self, evaluation: Dict[str, Any]):
        """Process a single evaluation"""
        evaluation_id = evaluation['id']
        evaluation_name = evaluation['name']
        rubric = evaluation['rubric']
        
        logger.info(f"Processing evaluation: {evaluation_name} ({evaluation_id})")
        
        try:
            # Update status to running
            self.db.update_evaluation_status(evaluation_id, 'running')
            
            # Get pending items
            items = self.db.get_evaluation_items(evaluation_id, status='pending')
            
            if not items:
                logger.info(f"No pending items for evaluation {evaluation_id}")
                self.db.update_evaluation_status(evaluation_id, 'completed')
                return
            
            logger.info(f"Processing {len(items)} items")
            
            # Get scorer based on rubric type
            rubric_type = rubric.get('type', 'llm')
            scorer = get_scorer(rubric_type)
            
            # Process each item
            for item in items:
                self.process_item(item, rubric, scorer)
            
            # Update evaluation status to completed
            self.db.update_evaluation_status(evaluation_id, 'completed')
            
            # Log final stats
            stats = self.db.get_evaluation_stats(evaluation_id)
            logger.info(
                f"Evaluation {evaluation_id} completed: "
                f"{stats['completed_items']}/{stats['total_items']} items scored, "
                f"average score: {stats['average_score']:.3f if stats['average_score'] else 'N/A'}"
            )
            
        except Exception as e:
            logger.error(f"Error processing evaluation {evaluation_id}: {e}", exc_info=True)
            self.db.update_evaluation_status(evaluation_id, 'failed', str(e))
    
    def process_item(self, item: Dict[str, Any], rubric: Dict[str, Any], scorer):
        """Process a single evaluation item"""
        item_id = item['id']
        prompt = item['prompt']
        model_output = item['model_output']
        expected_output = item.get('expected_output')
        
        retry_count = 0
        
        while retry_count < MAX_RETRIES:
            try:
                # Score the item
                score, explanation = scorer.score(
                    rubric=rubric,
                    prompt=prompt,
                    model_output=model_output,
                    expected_output=expected_output
                )
                
                # Update database
                self.db.update_item_score(item_id, score, explanation)
                
                logger.debug(f"Item {item_id} scored: {score:.3f}")
                return
                
            except Exception as e:
                retry_count += 1
                logger.warning(
                    f"Error scoring item {item_id} (attempt {retry_count}/{MAX_RETRIES}): {e}"
                )
                
                if retry_count >= MAX_RETRIES:
                    # Mark as error after max retries
                    self.db.update_item_error(item_id, str(e))
                    logger.error(f"Item {item_id} failed after {MAX_RETRIES} retries")
                else:
                    # Wait before retry
                    time.sleep(2 ** retry_count)  # Exponential backoff


def main():
    """Entry point"""
    logger.info("Starting EaaS Worker")
    worker = EvaluationWorker()
    worker.run()


if __name__ == '__main__':
    main()

