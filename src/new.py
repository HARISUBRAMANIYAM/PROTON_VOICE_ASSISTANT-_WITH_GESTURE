import os 
CHAT_HISTORY_DIR=os.path.join(os.path.dirname(os.path.abspath(__file__)), "chat_history")
def get_chat_history_files():
        """Get list of all available chat history files"""
        try:
            if not os.path.exists(CHAT_HISTORY_DIR):
                return {"status": "error", "message": "Chat history directory not found", "data": []}
                
            files = [f for f in os.listdir(CHAT_HISTORY_DIR) if f.endswith('.json')]
            files.sort(reverse=True)
           
            return {"status": "success", "data": files}
        except Exception as e:
            return {"status": "error", "message": str(e), "data": []}
print(get_chat_history_files())