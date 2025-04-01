import unittest
from unittest.mock import patch
from app import ChatBot

class TestChatBot(unittest.TestCase):
    
    @patch('builtins.print')
    def test_navigate_to(self, mock_print):
        page = "index.html"
        ChatBot.navigate_to(page)
        mock_print.assert_called_with(f"Navigate to{page}")

if __name__ == '__main__':
    unittest.main()