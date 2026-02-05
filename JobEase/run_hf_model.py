from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from huggingface_hub import login
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ==============================================================================
# AUTHENTICATION SETUP
# ==============================================================================
# OPTION 1: Load token from .env file
token = os.getenv("HF_TOKEN")
if token:
    login(token=token)
else:
    print("Warning: HF_TOKEN not found in environment variables. Assuming you are logged in via CLI.")

# OPTION 2: Run 'huggingface-cli login' in your terminal
# If you did Option 2, the script will automatically find your login.
# ==============================================================================

model_id = "MMohammad/new-finetune-flant5-base-model"

try:
    print(f"Loading model: {model_id}...")
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
    print("Model loaded successfully!")
except OSError as e:
    if "gated repo" in str(e) or "401" in str(e):
        print("\n❌ AUTHENTICATION ERROR: This is a private/gated model.")
        print("Please enable line 8 and paste your token, or run 'huggingface-cli login' in your terminal.\n")
    raise e

# Example usage
input_text = "Your input text here"
input_ids = tokenizer(input_text, return_tensors="pt").input_ids
outputs = model.generate(input_ids)
print("Output:", tokenizer.decode(outputs[0], skip_special_tokens=True))
