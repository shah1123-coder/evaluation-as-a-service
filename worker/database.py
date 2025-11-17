from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from typing import List, Dict, Any, Optional

class Database:
    def __init__(self):
        self.client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    def get_pending_evaluations(self) -> List[Dict[str, Any]]:
        """Fetch evaluations with status 'pending'"""
        response = self.client.table('evaluations').select('*').eq('status', 'pending').execute()
        return response.data
    
    def get_evaluation_items(self, evaluation_id: str, status: str = 'pending') -> List[Dict[str, Any]]:
        """Fetch evaluation items for a specific evaluation"""
        response = self.client.table('evaluation_items').select('*').eq('evaluation_id', evaluation_id).eq('status', status).execute()
        return response.data
    
    def update_evaluation_status(self, evaluation_id: str, status: str, error_message: Optional[str] = None):
        """Update evaluation status"""
        data = {'status': status}
        if error_message:
            data['error_message'] = error_message
        
        self.client.table('evaluations').update(data).eq('id', evaluation_id).execute()
    
    def update_item_score(self, item_id: str, score: float, explanation: str):
        """Update evaluation item with score and explanation"""
        self.client.table('evaluation_items').update({
            'score': score,
            'explanation': explanation,
            'status': 'scored'
        }).eq('id', item_id).execute()
    
    def update_item_error(self, item_id: str, error_message: str):
        """Mark evaluation item as error"""
        self.client.table('evaluation_items').update({
            'status': 'error',
            'error_message': error_message
        }).eq('id', item_id).execute()
    
    def get_evaluation_stats(self, evaluation_id: str) -> Dict[str, Any]:
        """Get statistics for an evaluation"""
        response = self.client.table('evaluation_items').select('score, status').eq('evaluation_id', evaluation_id).execute()
        items = response.data
        
        scored_items = [item for item in items if item['status'] == 'scored' and item['score'] is not None]
        
        if not scored_items:
            return {
                'total_items': len(items),
                'completed_items': 0,
                'average_score': None
            }
        
        average_score = sum(item['score'] for item in scored_items) / len(scored_items)
        
        return {
            'total_items': len(items),
            'completed_items': len(scored_items),
            'average_score': average_score
        }

