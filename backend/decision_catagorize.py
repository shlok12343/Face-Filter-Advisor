import os
import json
from groq import Groq

def call_groq(user_input, system_prompt=None, model="llama-3.3-70b-versatile"):
    """
    Sends a prompt to Groq's language model and returns the response.

    Parameters:
    - user_input (str): The user's input to include in the prompt.
    - system_prompt (str, optional): An optional system prompt to guide the model's behavior.
    - model (str): The Groq model to use. Default is 'llama-3.3-70b-versatile'.

    Returns:
    - str: The model's response.
    """
    client = Groq(api_key="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")

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        max_completion_tokens=512,
        temperature=0.5
    )

    return response.choices[0].message.content

def is_decision_prompt(user_input):
    system_prompt = """
    If it is a prompt asking for help with making a decision, output the options that the user can choose from seperated by a comma.
    If it is a prompt not asking for help with making a decision. then exactly and only say "Only help with decisions"
    examples:
    prompt: What is thermal energy, output: Only help with decisions
    prompt: Should i go to work tomorrow, output: go to work, don't go to work
    """
    result = call_groq(user_input, system_prompt)
    return json.dumps({"result": result})  # Wrap result in JSON with key 'result'

def catogorize_decision(user_input):
    if user_input == "Only help with decisions":
        return json.dumps({"result": "Only help with decisions"})  # Wrap result in JSON
    else:
        result = question_and_options(user_input)
        try:
            json_res = json.loads(result)
        except json.JSONDecodeError:
            print("Response is not valid JSON:")
            print(result)
            return json.dumps({"result": "Invalid JSON response"})
        return json.dumps({"result": json_res})  # Wrap result in JSON

def question_and_options(user_input):
    system_prompt = """
    You are helping with making a more inofrmed choice between things by getting more personal context from the user. 
    provide a list of things to consider when making this choice.
    Please respond only with a JSON with {}
    1. The things to consider can come as either as questions to ask the user or option for the user to choose.
    2. If the point to consider can be choosen from a list of options, then provide the options in the JSON if not then provide a question to consider.
    3. Add the questions to consider in the JSON in a list of strings with the key "questions"
    4. Add the options to choose from in the JSON in a list of (list of strings with each string an option) with the key "options"
    5. Do not include any other keys in the JSON
    6. The questions should all be directed to the user, and should be in the form of a question.
    7. The options should all be in the form of a statement.
    8. Do not include any additional text or commentary.
    9. the more specific the question the better.
    10. the more considerations to think about when making the choice given as options or questions to the user the better.
    11. give more options and less questions only use questions if you can not add the condiseration in multiple options the user can choose from.
    """
    return call_groq(user_input, system_prompt)

def get_answer(user_input):
    system_prompt = """
    1. You are helping with making a more inofrmed choice between things by getting more personal context from the user.
    2. You will be given context about the user to help you decided.
    3. The context will include a list of things to consider when making this choice.
    4. the context will include a list of questions and thier answers to help you decided.
    5. you will decide and give a final answer to the user based on the context.
    6. you will only give the a choice from the users choices.
    Please respond only with a JSON with {}
    respondse json example:
    {
        "answer": "the choice you made",
        "reasoning": "the reasoning behind the choice you made",
    }
    """
    result = call_groq(user_input, system_prompt)

    try:
        json_res = json.loads(result)
        return json.dumps({"result": json_res})
    except json.JSONDecodeError:
        print("Response is not valid JSON:")
        print(result)
        return json.dumps({"result": "Invalid JSON response"})


if __name__ == "__main__":
    # Example input
    user_input = "Should eat thai or chinese food"
    res = catogorize_decision(user_input)

    # Validate if the response is in JSON format
    try:
        json_res = json.loads(res)  # Parse the response as JSON
        print("Response is valid JSON:")
        print(json.dumps(json_res, indent=4))  # Pretty-print the JSON
    except json.JSONDecodeError:
        print("Response is not valid JSON:")
        print(res)