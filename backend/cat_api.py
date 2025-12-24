# Install Flask if not already installed: pip install flask
from flask import Flask, request, jsonify
from decision_catagorize import is_decision_prompt, catogorize_decision, get_answer
from flask_cors import CORS
import os
import requests


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


@app.route('/generate-filter', methods=['POST'])
def generate_filter():
    """
    Generate a face filter asset using an external image generation API.

    Expects JSON body:
    {
      "prompt": string,
      "region": "eyes" | "lips" | "full-face",
      "style": optional string
    }

    Returns JSON:
    { "imageBase64": string } on success, or { "error": string } on failure.
    """
    data = request.get_json(silent=True) or {}
    prompt = data.get('prompt', '').strip()
    region = data.get('region', 'full-face')
    style = data.get('style')

    if not prompt:
        return jsonify({"error": "Missing 'prompt' in request body."}), 400

    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        return jsonify({"error": "OPENAI_API_KEY is not set on the server."}), 500

    # Make the prompt a bit more specific based on region and style.
    region_description = {
        "eyes": "eye makeup or glasses overlay around the eyes",
        "lips": "lipstick overlay focused on the lips",
        "full-face": "full-face mask or makeup overlay"
    }.get(region, "face filter overlay")

    style_suffix = f" in style: {style}" if style else ""
    full_prompt = f"{prompt} as a transparent PNG {region_description}{style_suffix}. High contrast, clear edges, suited for AR face filters."

    try:
        response = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-image-1",
                "prompt": full_prompt,
                "n": 1,
                "size": "512x512",
                "response_format": "b64_json",
            },
            timeout=30,
        )
    except requests.RequestException as exc:
        return jsonify({"error": f"Error calling image generation service: {exc}"}), 502

    if response.status_code != 200:
        # Try to surface useful information from the API error response
        try:
            error_payload = response.json()
        except ValueError:
            error_payload = {"raw": response.text}
        return (
            jsonify(
                {
                    "error": "Image generation API returned an error.",
                    "details": error_payload,
                }
            ),
            502,
        )

    try:
        payload = response.json()
        data_list = payload.get("data") or []
        if not data_list:
            return jsonify({"error": "Image generation API response missing data."}), 502

        b64_image = data_list[0].get("b64_json")
        if not b64_image:
            return jsonify({"error": "Image generation API response missing b64_json."}), 502
    except (ValueError, KeyError, TypeError) as exc:
        return jsonify({"error": f"Failed to parse image generation response: {exc}"}), 502

    # Frontend will prefix with data:image/png;base64, for an <img> or canvas
    return jsonify({"imageBase64": b64_image})


if __name__ == '__main__':
    # In development, this will run on http://localhost:5000 by default.
    app.run(debug=True)