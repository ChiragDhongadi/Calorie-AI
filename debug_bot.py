import os
import dotenv
from FitnessChatbot import chat_function

dotenv.load_dotenv()

def test_flow():
    chat_history = []
    user_data = {}
    
    inputs = [
        "Weight loss", # Goal
        "25",          # Age
        "Male",        # Gender
        "80kg",        # Weight
        "180cm",       # Height
        "Moderately active",
        "None",        # Dietary pref
        "None",        # Restrictions
        "Gym",         # Workout pref
        "test@example.com" # Email
    ]
    
    print("--- Starting Full Chat Flow Test ---")
    current_history = chat_history
    current_data = user_data
    
    # Initial greeting
    current_history, current_data, _ = chat_function("", current_history, current_data)
    
    for i, user_input in enumerate(inputs):
        print(f"\nStep {i+1} Input: {user_input}")
        current_history, current_data, _ = chat_function(user_input, current_history, current_data)
        bot_response = current_history[-1][1]
        print(f"Bot: {bot_response[:100]}...")
        
    if current_data.get('plan_generated'):
        print("\n✅ Success: Plan was generated!")
    else:
        print("\n❌ Failure: Plan was not generated.")

if __name__ == "__main__":
    test_flow()
