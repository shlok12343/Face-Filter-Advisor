# Install Flask if not already installed: pip install flask
from flask import Flask, request, jsonify
from decision_catagorize import is_decision_prompt, catogorize_decision, get_answer
import json
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.route('/api/categorize-decision', methods=['POST'])
def categorize_decision():
    data = request.json
    user_input = data.get('user_input', '')
    result = catogorize_decision(user_input)
    return result

@app.route('/api/is-decision', methods=['POST'])
def is_decision():
    data = request.json
    user_input = data.get('user_input', '')
    result = is_decision_prompt(user_input)
    return result

@app.route('/api/get-answer', methods=['POST'])
def get_answer_route():
    data = request.json
    user_input = data.get('user_input', '')
    result = get_answer(user_input)
    return result


if __name__ == '__main__':
    app.run(debug=True)