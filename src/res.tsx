// Function to call the '/api/categorize-decision' endpoint
export async function categorizeDecision(userInput: string): Promise<any> {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/categorize-decision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_input: userInput }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data['result'];
  } catch (error) {
    console.error('Error calling categorizeDecision:', error);
    throw error;
  }
}

// Function to call the '/api/is-decision' endpoint
export async function isDecision(userInput: string): Promise<any> {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/is-decision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_input: userInput }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data['result'];
  } catch (error) {
    console.error('Error calling isDecision:', error);
    throw error;
  }
}

// Function to call the '/api/get-answer' endpoint
export async function getAnswer(userInput: string): Promise<any> {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/get-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_input: userInput }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data['result'];
  } catch (error) {
    console.error('Error calling getAnswer:', error);
    throw error;
  }
}


