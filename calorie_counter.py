import os
import json
import base64
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def analyze_meal_image(base64_image):
    """
    Analyzes a meal image using Groq's vision model and returns nutritional info.
    Compatible with the web application flow.
    """
    try:
        # Initialize Groq client
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return {"error": "GROQ_API_KEY not found in environment variables"}
            
        client = Groq(api_key=api_key)
        
        # Ensure base64 string is clean (remove data:image/jpeg;base64, if present)
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]
            
        # Model requested: meta-llama/llama-4-scout-17b-16e-instruct
        model_id = "meta-llama/llama-4-scout-17b-16e-instruct"
        
        system_prompt = """You are a professional dietitian. Analyze the meal image and return the nutritional estimate in STRICT JSON format with exactly these keys:

{
    "name": "string",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number
}

IMPORTANT: 
- Provide estimates for protein, carbs, and fats in grams.
- Return ONLY the JSON object. No other text."""


        print(f"--- Vision Analysis Started ---")
        print(f"Model: {model_id}")
        print(f"Image Data Length: {len(base64_image)} chars")
        
        completion = client.chat.completions.create(
            model=model_id,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this meal image and calculate calories and macros."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        result_content = completion.choices[0].message.content.strip()
        print(f"LLM Raw Response: {result_content}")
        
        # Clean markdown backticks if present
        if result_content.startswith("```"):
            start = result_content.find("{")
            end = result_content.rfind("}") + 1
            if start != -1 and end != 0:
                result_content = result_content[start:end]
        
        return json.loads(result_content)
        
    except Exception as e:
        print(f"CRITICAL ERROR in analyze_meal_image: {e}")
        return {"error": str(e)}


def get_calories_from_image(image_path):
    """
    CLI compatible function that reads an image from a path.
    """
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode("utf-8")
    return analyze_meal_image(base64_image)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        result = get_calories_from_image(image_path)
        print(json.dumps(result, indent=4))
    else:
        print("Please provide an image path: python calorie_counter.py <path_to_image>")
