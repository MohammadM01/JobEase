# How to Use the JobEase Model

The model is hosted on Hugging Face Hub: [MMohammad/new-finetune-flant5-base-model](https://huggingface.co/MMohammad/new-finetune-flant5-base-model)

## 1. Installation

Your team needs to install the necessary libraries:

```bash
pip install transformers torch
```

## 2. Loading the Model in Python

Use the following code to load the model and tokenizer:

```python
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Load model and tokenizer from Hugging Face
model_id = "MMohammad/new-finetune-flant5-base-model"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)

# Example usage
input_text = "Your input text here"
input_ids = tokenizer(input_text, return_tensors="pt").input_ids
outputs = model.generate(input_ids)
print(tokenizer.decode(outputs[0]))
```

## 3. Cloning the Repo (Optional)

If you need the files locally without Python:

```bash
git lfs install
git clone https://huggingface.co/MMohammad/new-finetune-flant5-base-model
```

## 4. Team Workflow (Collaboration)

### How to Share

- **If Public:** Just share the link. Anyone can download.
- **If Private:** Go to **Settings > Access** on the Hugging Face model page and add your teammates' usernames.
- **To Allow Teammates to Upload:** You MUST add them as **Contributors** in Settings (even if the model is public), or move the model to a shared Organization.

### How to Upload New Versions

If you or a teammate retrains the model:

1.  Save the new model files in this directory.
2.  Run the upload command again:
    ```powershell
    hf upload MMohammad/new-finetune-flant5-base-model .
    ```
    _This creates a new "Commit" (version) automatically._

### How to Get the Latest Version

- **In Python:** The `.from_pretrained()` function automatically fetches the latest version.
- **If using Git:** Run `git pull` inside the model folder.
