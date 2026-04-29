#pip install gradio langchain langchain-groq serper-dev python-dotenv

import os
import traceback
import datetime
from typing import List, Tuple, Optional

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.tools import BaseTool
import json
import requests
import dotenv

# Load environment variables
dotenv.load_dotenv()


# ----------- SERPER SEARCH TOOL ------------

class SerperSearchTool(BaseTool):
    name: str = "search_web"
    description: str = "Searches the web for real-time information and returns structured results"

    def _run(self, query: str) -> str:
        """Search the web using Serper API"""
        try:
            api_key = os.getenv("SERPER_API_KEY")
            if not api_key:
                return "Error: SERPER_API_KEY not found in environment variables"

            url = "https://google.serper.dev/search"
            payload = json.dumps({"q": query})
            headers = {
                'X-API-KEY': api_key,
                'Content-Type': 'application/json'
            }

            response = requests.post(url, headers=headers, data=payload, timeout=10)
            response.raise_for_status()
            search_results = response.json()

            # Extract and format organic results
            results = []
            if 'organic' in search_results:
                for item in search_results['organic'][:5]:  # Limit to top 5 results
                    results.append({
                        "title": item.get('title', ''),
                        "link": item.get('link', ''),
                        "snippet": item.get('snippet', '')
                    })

            # Format results in a readable way
            if results:
                formatted_results = "Search Results:\n\n"
                for i, result in enumerate(results, 1):
                    formatted_results += f"{i}. {result['title']}\n"
                    formatted_results += f"   {result['snippet']}\n"
                    formatted_results += f"   URL: {result['link']}\n\n"
                return formatted_results
            else:
                return "No search results found."

        except requests.exceptions.RequestException as e:
            return f"Error performing search - Network issue: {str(e)}"
        except Exception as e:
            return f"Error performing search: {str(e)}"

    async def _arun(self, query: str) -> str:
        """Async version of search"""
        return self._run(query)


# ----------- USER DATA TRACKER CLASS ------------

class UserDataTracker:
    def __init__(self):
        self.data = {}
        # Define required fields with their validation functions and question prompts
        self.required_fields = {
            'fitness_goal': {
                'question': "What is your primary fitness goal? (e.g., weight loss, muscle gain, general fitness)",
                'validate': self._validate_fitness_goal
            },
            'age': {
                'question': "How old are you? (Must be between 10-100)",
                'validate': self._validate_age
            },
            'gender': {
                'question': "What is your gender? (male/female/other)",
                'validate': self._validate_gender
            },
            'weight': {
                'question': "What is your current weight? (e.g., 150 lbs or 68 kg)",
                'validate': self._validate_weight
            },
            'height': {
                'question': "What is your height? (e.g., 5'10\" or 178 cm)",
                'validate': self._validate_height
            },
            'activity_level': {
                'question': "What is your activity level? (sedentary, lightly active, moderately active, very active, extremely active)",
                'validate': self._validate_activity_level
            },
            'dietary_preferences': {
                'question': "Do you follow any specific diet? (e.g., vegetarian, vegan, keto, none)",
                'validate': self._validate_dietary_preferences
            },
            'dietary_restrictions': {
                'question': "Any food allergies or dietary restrictions? (e.g., nuts, dairy, gluten, none)",
                'validate': self._validate_dietary_restrictions
            },
            'workout_preferences': {
                'question': "What are your workout preferences? (e.g., gym, home workouts, equipment available, any injuries?)",
                'validate': self._validate_workout_preferences
            },
            'email': {
                'question': "Finally, what is your email address? (to send your complete plan)",
                'validate': self._validate_email
            }
        }
        self.current_step = 0

    def is_complete(self):
        """Check if all required fields have been collected and validated"""
        return all(field in self.data for field in self.required_fields)

    def get_next_missing_field(self):
        """Get the next field that needs to be collected"""
        for field in self.required_fields:
            if field not in self.data:
                return field
        return None

    def get_next_question(self):
        """Get the next question to ask the user"""
        next_field = self.get_next_missing_field()
        if next_field:
            return self.required_fields[next_field]['question']
        return None

    def add_data(self, field, value):
        """Add and validate user data"""
        if field in self.required_fields:
            # Validate the input
            validation_result = self.required_fields[field]['validate'](value)
            if validation_result['valid']:
                self.data[field] = validation_result['value']
                return True, ""
            else:
                return False, validation_result['message']
        return False, f"Unknown field: {field}"

    def get_completion_percentage(self):
        """Calculate completion percentage"""
        completed = sum(1 for field in self.required_fields if field in self.data)
        return int((completed / len(self.required_fields)) * 100)

    # Validation methods for each field
    def _validate_fitness_goal(self, value):
        value = value.strip().lower()
        if not value or len(value) < 3:
            return {'valid': False, 'message': "Please provide a valid fitness goal (e.g., weight loss, muscle gain)"}
        return {'valid': True, 'value': value}

    def _validate_age(self, value):
        try:
            age = int(value.strip())
            if age < 10 or age > 100:
                return {'valid': False, 'message': "Please enter a valid age between 10 and 100"}
            return {'valid': True, 'value': age}
        except ValueError:
            return {'valid': False, 'message': "Please enter a valid number for age"}

    def _validate_gender(self, value):
        value = value.strip().lower()
        if not value or len(value) < 3:
            return {'valid': False, 'message': "Please specify your gender (male/female/other)"}
        return {'valid': True, 'value': value}

    def _validate_weight(self, value):
        value = value.strip().lower()
        try:
            # Extract number and unit
            parts = value.split()
            if len(parts) < 1:
                return {'valid': False, 'message': "Please include both number and unit (e.g., 150 lbs or 68 kg)"}

            # Try to extract the number
            num_str = ''
            for c in parts[0]:
                if c.isdigit() or c == '.':
                    num_str += c
                else:
                    break

            if not num_str:
                return {'valid': False, 'message': "Please enter a valid weight (e.g., 150 lbs or 68 kg)"}

            weight = float(num_str)
            if weight <= 0 or weight > 1000:  # Reasonable weight range
                return {'valid': False, 'message': "Please enter a valid weight"}

            # Check for unit
            unit = 'kg' if 'kg' in value else 'lbs' if 'lb' in value or 'pound' in value else None
            if not unit:
                # Default to kg if number is small, lbs if large
                unit = 'kg' if weight < 100 else 'lbs'

            return {'valid': True, 'value': f"{weight} {unit}"}
        except ValueError:
            return {'valid': False, 'message': "Please enter a valid weight (e.g., 150 lbs or 68 kg)"}

    def _validate_height(self, value):
        value = value.strip().lower()
        # Check for cm
        if 'cm' in value:
            try:
                cm = float(value.replace('cm', '').strip())
                if cm < 50 or cm > 300:  # Reasonable height range in cm
                    return {'valid': False, 'message': "Please enter a valid height in cm (50-300cm)"}
                return {'valid': True, 'value': f"{cm} cm"}
            except ValueError:
                pass

        # Check for feet/inches format (e.g., 5'10")
        if "'" in value or 'ft' in value or 'inch' in value or '\"' in value:
            try:
                # Handle various formats like 5'10", 5ft 10in, 5 feet 10 inches, etc.
                parts = value.replace('\"', "'").replace('ft', "'").replace('in', "").replace('inches', '').replace('inch', '').replace('"', '').split("'")
                feet = float(parts[0].strip())
                inches = float(parts[1].strip()) if len(parts) > 1 and parts[1].strip() else 0

                if feet < 3 or feet > 8 or inches < 0 or inches >= 12:
                    return {'valid': False, 'message': "Please enter a valid height (e.g., 5'10\" or 180cm)"}

                return {'valid': True, 'value': f"{int(feet)}'{int(inches)}\""}
            except (ValueError, IndexError):
                pass

        return {'valid': False, 'message': "Please enter a valid height (e.g., 5'10\" or 180cm)"}

    def _validate_activity_level(self, value):
        value = value.strip().lower()
        levels = ['sedentary', 'lightly active', 'moderately active', 'very active', 'extremely active']

        # Try to match with known activity levels
        for level in levels:
            if level in value:
                return {'valid': True, 'value': level}

        # If no exact match, ask for clarification
        return {'valid': False, 'message': "Please choose one: " + ", ".join(levels)}

    def _validate_dietary_preferences(self, value):
        value = value.strip().lower()
        if not value or len(value) < 3:
            return {'valid': False, 'message': "Please specify your dietary preferences (e.g., vegetarian, vegan, none)"}
        return {'valid': True, 'value': value}

    def _validate_dietary_restrictions(self, value):
        value = value.strip().lower()
        if not value or 'none' in value:
            return {'valid': True, 'value': 'none'}
        return {'valid': True, 'value': value}

    def _validate_workout_preferences(self, value):
        value = value.strip()
        if not value or len(value) < 5:
            return {'valid': False, 'message': "Please provide some details about your workout preferences (e.g., gym access, home workouts, any injuries?)"}
        return {'valid': True, 'value': value}

    def _validate_email(self, value):
        import re
        value = value.strip().lower()
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, value):
            return {'valid': False, 'message': "Please enter a valid email address."}
        return {'valid': True, 'value': value}


# ----------- UTILITY FUNCTIONS ------------

def extract_email_from_text(text: str) -> Optional[str]:
    """Simple regex to extract email from user input"""
    import re
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else None

def format_plan_for_email(plan_text: str) -> str:
    """Format the plan text for HTML email"""
    # Simple conversion: newlines to <br>, bold to <strong>
    import re
    html = plan_text.replace('\n', '<br>')
    # Convert **bold** or __bold__ to <strong>
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'__(.*?)__', r'<strong>\1</strong>', html)
    return html

def send_email(to_list: List[str], subject: str, body: str) -> bool:
    """Mock send email - returns success to prevent flow breakage"""
    print(f"📧 [MOCK EMAIL] To: {to_list}, Subject: {subject}")
    return True



# ----------- LANGCHAIN AGENT SETUP ------------

def initialize_calyx_agent():
    """Initialize the Calyx AI agent with error handling"""
    try:
        # Check for Groq API key
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")

        # Initialize the language model with correct model name
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            api_key=groq_key
        )


        # System prompt with strict requirements
        system_prompt = """You are Calyx AI, an expert AI fitness and nutrition coach focused solely on gym workouts and diet.

        CRITICAL RULES - MUST FOLLOW STRICTLY:
        1. NEVER generate a fitness or diet plan until ALL required information is collected
        2. Ask for information ONE piece at a time in the specified order
        3. DO NOT proceed to the next question until you get a valid response to the current question
        4. If user tries to skip ahead, politely explain you need the information in order

        REQUIRED INFORMATION (MUST collect ALL before any plan):
        FOLLOW THIS ORDER STRICTLY:
        1. Primary fitness goal (weight loss, muscle gain, general fitness, etc.)
           - If they mention both workout and diet, ask which is their primary focus

        2. Age (must be a number between 10-100)
           - If not provided, say: "I need your age to create a safe and effective plan. How old are you?"

        3. Gender (male/female/other)
           - Important for accurate calorie and nutrition calculations

        4. Current weight (must include units - kg or lbs)
           - Ask: "What is your current weight? (please include kg or lbs)"

        5. Height (must include units - cm or feet/inches)
           - Ask: "What is your height? (e.g., 5'10\" or 178cm)"

        6. Activity level (choose one):
           - Sedentary (little to no exercise)
           - Lightly active (light exercise 1-3 days/week)
           - Moderately active (moderate exercise 3-5 days/week)
           - Very active (hard exercise 6-7 days/week)
           - Extremely active (very hard exercise & physical job)

        7. Dietary preferences:
           - Vegetarian, non-vegetarian, vegan, pescatarian, keto, etc.
           - If they don't specify, ask: "Do you follow any specific diet? (e.g., vegetarian, vegan, etc.)"

        8. Any dietary restrictions or allergies:
           - If they say none, confirm: "No food allergies or dietary restrictions?"

        9. Workout preferences and limitations:
           - Gym access? Home workouts? Equipment available?
           - Any injuries or health conditions to consider?

        10. Email address (for sending the final plan)

        IMPORTANT INSTRUCTIONS:
        - After EACH response, acknowledge what you've recorded before asking the next question
        - Keep track of what information you've collected
        - If user asks for a plan early, respond: "I need to collect some more information to create a safe and effective plan for you. [Next question]"
        - Only after collecting ALL information, provide a summary and ask for confirmation
        - After confirmation, generate the detailed plan
        - Finally, ask for their email to send the complete plan

        PLAN GENERATION (ONLY after ALL info is collected and confirmed):
        - Create a personalized plan based on ALL collected information
        - Include specific exercises with sets, reps, and rest periods
        - Provide detailed meal plans with portion sizes
        - Include rest days and recovery recommendations

        RESPONSE STYLE:
        - Be warm and encouraging but professional
        - One question at a time
        - Acknowledge their answers before moving on
        - If they try to skip ahead, gently guide them back
        - Keep responses clear and to the point

        REMEMBER: NO PLAN until ALL information is collected and confirmed!"""

        class SimpleAgent:
            def __init__(self, llm, system_prompt):
                self.llm = llm
                self.system_prompt = system_prompt
                
            def invoke(self, inputs):
                prompt = inputs.get("input", "")
                history = inputs.get("chat_history", [])
                
                messages = [SystemMessage(content=self.system_prompt)]
                for u, b in history:
                    if u:
                        messages.append(HumanMessage(content=u))
                    if b:
                        messages.append(AIMessage(content=b))
                messages.append(HumanMessage(content=prompt))
                
                response = self.llm.invoke(messages)
                return {"output": response.content}

        agent = SimpleAgent(llm, system_prompt)

        print("Calyx AI agent initialized successfully")
        return agent

    except Exception as e:
        print(f"Failed to initialize Calyx AI agent: {e}")
        traceback.print_exc()
        return None

# Initialize the agent
agent = initialize_calyx_agent()



# ----------- GRADIO CHATBOT LOGIC ------------

def is_plan_content(text: str) -> bool:
    """Check if the text contains a fitness plan with detailed content"""
    if not text or len(text.strip()) < 100:  # Too short to be a complete plan
        return False

    # Check for common plan indicators
    plan_indicators = [
        'workout plan', 'exercise routine', 'training program',
        'meal plan', 'nutrition plan', 'diet plan', 'weekly schedule',
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
        'sets x reps', 'rest between sets', 'warm up', 'cool down',
        'day 1', 'day 2', 'day 3', 'day 4', 'day 5', 'day 6', 'day 7',
        'breakfast', 'lunch', 'dinner', 'snacks', 'meals', 'nutrition',
        'exercise', 'workout', 'training', 'routine', 'program', 'plan'
    ]

    # Check for multiple indicators to reduce false positives
    text_lower = text.lower()
    matching_indicators = [ind for ind in plan_indicators if ind in text_lower]

    # Require at least 3 matching indicators to consider it a plan
    return len(matching_indicators) >= 3

def format_plan_for_text(plan_text: str) -> str:
    """Format the plan text into proper text"""

    # Split into sections and format
    sections = plan_text.split('\n\n')
    formatted_content = []

    for section in sections:
        if not section.strip():
            continue

        lines = section.split('\n')
        section_text = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check if it's a header (ends with : or is all caps)
            if line.endswith(':') or (line.isupper() and len(line) > 3):
                section_text.append(f"{line}\n")
            # Check if it's a day or week header
            elif any(day in line.lower() for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'week', 'day']):
                section_text.append(f"{line}\n")
            # Check if it's a numbered or bulleted list item
            elif line[0].isdigit() or line.startswith('-') or line.startswith('•'):
                section_text.append(f"{line}\n")
            # Regular paragraph
            else:
                section_text.append(f"{line}\n")

        if section_html:
            # Wrap list items in ul tags
            formatted_section = '\n'.join(section_html)
            if '<li' in formatted_section:
                # Find consecutive li tags and wrap them
                import re
                formatted_section = re.sub(r'(<li[^>]*>.*?</li>)(\s*<li)', r'<ul style="margin: 10px 0; padding-left: 25px;">\1</ul>\2', formatted_section)
                formatted_section = re.sub(r'(<li[^>]*>.*?</li>)(?!\s*<li)', r'<ul style="margin: 10px 0; padding-left: 25px;">\1</ul>', formatted_section)

            formatted_content.append(f'<div style="margin-bottom: 25px;">{formatted_section}</div>')

    return '\n'.join(formatted_content)

def chat_function(user_input: str, chat_history: List[Tuple[str, str]],
                 user_data: dict) -> Tuple[List[Tuple[str, str]], dict, str]:
    """Main chat function with strict data collection flow"""
    if not agent:
        error_msg = "❌ Calyx AI is not available. Please check your API keys and try again."
        chat_history.append((user_input, error_msg))
        return chat_history, user_data, ""

    try:
        # Initialize user data tracker if not exists
        if "tracker" not in user_data:
            user_data["tracker"] = UserDataTracker()

        tracker = user_data["tracker"]

        # First interaction: agent greets and starts asking
        if not chat_history:
            try:
                greeting = """Hello! Welcome to Calyx AI! 🏋️‍♂️

I'm here to create a personalized workout and diet plan just for you. To make sure I design the perfect plan, I'll need to ask you a few questions first.

Let's start with the most important one: **What is your primary fitness goal?**

For example:
- Weight loss
- Muscle gain/building
- General fitness
- Strength training
- Endurance improvement
- Body toning

What would you like to achieve?"""
                chat_history = [("", greeting)]
                return chat_history, user_data, ""
            except Exception as e:
                error_msg = f"❌ Error starting conversation: {str(e)}"
                chat_history = [("", error_msg)]
                return chat_history, user_data, ""

        # Process user input
        if user_input.strip():
            try:
                # Get the next field we need to collect
                next_field = tracker.get_next_missing_field()

                # If we have all required data, just pass through to the agent
                if not next_field:
                    # Check if we've already generated a plan
                    if user_data.get('plan_generated'):
                        # If plan was already generated, just respond to the query
                        agent_response = agent.invoke({"input": user_input, "chat_history": chat_history})
                        chat_history.append((user_input, agent_response.get("output", "I'm not sure how to respond to that.")))
                        return chat_history, user_data, ""

                    # If we get here, we need to generate the plan
                    user_data['plan_generated'] = True  # Mark plan as generated

                    # Generate the plan with strict adherence to dietary preferences and fitness goals
                    user_info = user_data['tracker'].data
                    fitness_goal = user_info.get('fitness_goal', 'general fitness').lower()
                    dietary_pref = user_info.get('dietary_preferences', 'no specific diet').lower()

                    chat_history.append((user_input, "✅ Perfect! I'm creating your personalized plan now. This might take a moment..."))

                    plan_prompt = f"""Create a detailed, personalized fitness and nutrition plan based on the following user information:

                    USER INFORMATION:
                    {user_info}

                    IMPORTANT INSTRUCTIONS:
                    1. WORKOUT PLAN:
                       - Create a {fitness_goal}-focused weekly workout plan
                       - Include specific exercises with sets, reps, and rest periods
                       - Consider user's workout preferences: {user_info.get('workout_preferences', 'no specific preferences')}

                    2. NUTRITION PLAN (STRICTLY {dietary_pref.upper()}):
                       - Create a daily meal plan that strictly follows {dietary_pref} dietary preferences
                       - Include portion sizes and nutritional information
                       - Ensure meals align with {fitness_goal} goals
                       - Consider any dietary restrictions: {user_info.get('dietary_restrictions', 'none')}

                    3. REST AND RECOVERY:
                       - Include rest day recommendations
                       - Add recovery techniques
                       - Suggest sleep and hydration targets

                    4. ADDITIONAL TIPS:
                       - Specific to {fitness_goal} goals
                       - Consider user's activity level: {user_info.get('activity_level', 'moderate')}

                    IMPORTANT: The meal plan MUST be {dietary_pref}. Do not include any non-{dietary_pref} foods if the user is vegetarian/vegan."""

                    plan_response = agent.invoke({"input": plan_prompt, "chat_history": chat_history})
                    plan = plan_response.get("output", "I'm sorry, I couldn't generate a plan at the moment. Please try again later.")
                    chat_history.append(("", f"Here's your personalized fitness plan! 🎉\n\n{plan}"))

                    # If we have an email, send the plan
                    if user_data.get("email") and not user_data.get("plan_sent"):
                        formatted_plan = format_plan_for_email(plan)
                        current_year = datetime.datetime.now().year

                        # Create HTML email template using f-string with escaped braces
                        html_body = f"""
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Your Personalized Fitness Plan</title>
                            <style>
                                body {{
                                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                    line-height: 1.6;
                                    color: #333;
                                    max-width: 800px;
                                    margin: 0 auto;
                                    padding: 20px;
                                    background-color: #f5f7fa;
                                }}
                                .email-container {{
                                    background-color: #ffffff;
                                    border-radius: 10px;
                                    overflow: hidden;
                                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                                }}
                                .header {{
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 40px 30px;
                                    text-align: center;
                                }}
                                .content {{
                                    padding: 30px;
                                }}
                            </style>
                        </head>
                        <body>
                            <div class="email-container">
                                <div class="header">
                                    <h1>🏋️‍♂️ Your Personalized Fitness Plan</h1>
                                    <p>Customized workout and nutrition plan designed just for you</p>
                                </div>
                                <div class="content">
                                    {formatted_plan}
                                    <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                                        <p>💡 <strong>Tip:</strong> For best results, follow this plan consistently and track your progress!</p>
                                    </div>
                                </div>
                                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                                    <p>© {current_year} Calyx AI. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """

                        try:
                            # Call send_email function and check the result properly
                            email_result = send_email(
                                [user_data["email"]],
                                "🏋️‍♂️ Your Personalized Fitness & Nutrition Plan",
                                html_body
                            )

                            # Check if email was sent successfully
                            if email_result is not None:
                                user_data["plan_sent"] = True
                                chat_history.append(("", f"✅ I've sent a copy of your plan to {user_data['email']}!"))
                            else:
                                # Email sending failed, provide fallback
                                chat_history.append(("", "📧 I couldn't send the email, but here's your plan. You can copy it below:"))
                                chat_history.append(("", "--- COPY YOUR PLAN BELOW THIS LINE ---"))
                                chat_history.append(("📋 Your Plan:", plan))
                                chat_history.append(("", "--- END OF PLAN ---"))
                                chat_history.append(("", "You can select and copy the text above to save it elsewhere."))
                        except Exception as e:
                            print(f"Email sending error: {e}")
                            # If there's any error with email sending, provide the plan in the chat
                            chat_history.append(("", "📧 I had trouble sending the email, but here's your plan. You can copy it below:"))
                            chat_history.append(("", "--- COPY YOUR PLAN BELOW THIS LINE ---"))
                            chat_history.append(("📋 Your Plan:", plan))
                            chat_history.append(("", "--- END OF PLAN ---"))
                            chat_history.append(("", "You can select and copy the text above to save it elsewhere."))

                    return chat_history, user_data, ""

                # Try to extract email if that's the next field
                if next_field == 'email':
                    email = extract_email_from_text(user_input)
                    if email:
                        success, message = tracker.add_data('email', email)
                        if success:
                            user_data["email"] = email
                            next_field = tracker.get_next_missing_field()
                            if next_field:
                                chat_history.append((user_input, f"✅ Got it! {tracker.required_fields[next_field]['question']}"))
                            else:
                                chat_history.append((user_input, "✅ Got it! Now I have all the information I need to create your personalized plan. Let me work on that for you!"))
                            return chat_history, user_data, ""
                        else:
                            chat_history.append((user_input, f"❌ {message}"))
                            return chat_history, user_data, ""

                # For other fields, try to add the data
                success, message = tracker.add_data(next_field, user_input)

                if success:
                    # Data added successfully, ask for the next field
                    next_field = tracker.get_next_missing_field()
                    if next_field:
                        # Ask for the next piece of information
                        response = f"✅ Got it! {tracker.required_fields[next_field]['question']}"
                        chat_history.append((user_input, response))
                    else:
                        # All required data collected!
                        response = "✅ Perfect! I have all the information I need to create your personalized plan. Let me work on that for you!"
                        chat_history.append((user_input, response))

                        # Generate the plan with strict adherence to dietary preferences and fitness goals
                        user_info = user_data['tracker'].data
                        fitness_goal = user_info.get('fitness_goal', 'general fitness').lower()
                        dietary_pref = user_info.get('dietary_preferences', 'no specific diet').lower()

                        plan_prompt = f"""Create a detailed, personalized fitness and nutrition plan based on the following user information:

                        USER INFORMATION:
                        {user_info}

                        IMPORTANT INSTRUCTIONS:
                        1. WORKOUT PLAN:
                           - Create a {fitness_goal}-focused weekly workout plan
                           - Include specific exercises with sets, reps, and rest periods
                           - Consider user's workout preferences: {user_info.get('workout_preferences', 'no specific preferences')}

                        2. NUTRITION PLAN (STRICTLY {dietary_pref.upper()}):
                           - Create a daily meal plan that strictly follows {dietary_pref} dietary preferences
                           - Include portion sizes and nutritional information
                           - Ensure meals align with {fitness_goal} goals
                           - Consider any dietary restrictions: {user_info.get('dietary_restrictions', 'none')}

                        3. REST AND RECOVERY:
                           - Include rest day recommendations
                           - Add recovery techniques
                           - Suggest sleep and hydration targets

                        4. ADDITIONAL TIPS:
                           - Specific to {fitness_goal} goals
                           - Consider user's activity level: {user_info.get('activity_level', 'moderate')}

                        IMPORTANT: The meal plan MUST be {dietary_pref}. Do not include any non-{dietary_pref} foods if the user is vegetarian/vegan."""

                        # Fixed: Use agent.invoke instead of agent.run
                        plan_response = agent.invoke({"input": plan_prompt})
                        plan = plan_response.get("output", "I'm sorry, I couldn't generate a plan at the moment. Please try again later.")
                        chat_history.append(("", f"Here's your personalized fitness plan! 🎉\n\n{plan}"))

                        # Show the plan in the chat
                        chat_history.append(("", "📋 Here's your personalized fitness plan!"))
                        chat_history.append(("", "--- COPY YOUR PLAN BELOW THIS LINE ---"))
                        chat_history.append(("📋 Your Plan:", plan))
                        chat_history.append(("", "--- END OF PLAN ---"))
                        chat_history.append(("", "You can select and copy the text above to save it."))
                else:
                    # Show validation error and ask again
                    chat_history.append((user_input, f"❌ {message}"))

                return chat_history, user_data, ""

            except Exception as e:
                error_msg = f"❌ I encountered an issue: {str(e)}. Let me try to help you differently."
                chat_history.append((user_input, error_msg))
                print(f"Error in chat_function: {e}")
                traceback.print_exc()
                return chat_history, user_data, ""

        return chat_history, user_data, ""

    except Exception as e:
        error_msg = f"❌ An unexpected error occurred. Let's start fresh - what's your fitness goal?"
        chat_history.append((user_input, error_msg))
        print(f"Unexpected error in chat_function: {e}")
        traceback.print_exc()
        return chat_history, user_data, ""



