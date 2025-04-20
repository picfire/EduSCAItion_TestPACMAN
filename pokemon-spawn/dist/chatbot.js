import { HF_API_TOKEN, SYSTEM_PROMPT } from './config.js';

async function getChatbotResponse(message) {
    const API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large";

    try {
        console.log('API Request URL:', API_URL);
        console.log('API Request Body:', JSON.stringify({ inputs: `${SYSTEM_PROMPT}\n\nUser: ${message}\nAssistant:` }));

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: `${SYSTEM_PROMPT}\n\nUser: ${message}\nAssistant:` })
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (data && data[0] && data[0].generated_text) {
            return data[0].generated_text;
        } else {
            console.log('Fallback triggered');
            return "Sorry, I'm having trouble connecting to the AI right now.";
        }
    } catch (error) {
        console.error('Network Error:', error);
        return "Sorry, I'm having connection issues, but let me help anyway!";
    }
}

async function handleSendMessage() {
    const message = chatInput.value;

    if (message && message.trim().length > 0) {
        addMessage(message, true);
        chatInput.value = '';

        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message', 'typing');
        typingDiv.textContent = "Professor Oak's Assistant is thinking...";
        chatMessages.appendChild(typingDiv);

        try {
            const response = await getChatbotResponse(message);
            typingDiv.remove();
            addMessage(response, false);
        } catch (error) {
            typingDiv.remove();
            addMessage("I'm having connection issues, but let me help anyway!", false);
        }
    }
}

function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    const responses = {
        variable: {
            explanation: "Variables are like Pokéballs - they store different types of data!",
            examples: [
                "String pokemonName = \"Pikachu\";  // Stores text",
                "int level = 25;                    // Stores whole numbers",
                "boolean isElectricType = true;     // Stores true/false",
                "double speed = 90.5;               // Stores decimal numbers"
            ]
        },
        string: {
            explanation: "Strings are like Pokémon names - they store text data!",
            examples: [
                "String trainerName = \"Ash\";",
                "String gymBadge = \"Thunder Badge\";",
                "String pokemonType = \"Electric\";"
            ]
        },
        number: {
            explanation: "Numbers are like Pokémon stats - they track values!",
            examples: [
                "int hp = 100;          // Health points",
                "double attack = 55.5;   // Attack power",
                "int defense = 40;       // Defense points"
            ]
        }
    };

    for (const [key, content] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return `${content.explanation}\n\nExamples:\n${content.examples.join('\n')}`;
        }
    }
    return "Try asking about variables, strings, or numbers in programming!";
}

export { getChatbotResponse };