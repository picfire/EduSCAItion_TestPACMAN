import { HF_API_TOKEN, SYSTEM_PROMPT } from './config.js';

async function getChatbotResponse(message) {
    const API_URL = "https://api-inference.huggingface.co/models/facebook/opt-350m";
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "inputs": message,
                "parameters": {
                    "max_length": 100,
                    "temperature": 0.7,
                    "return_full_text": false
                }
            })
        });

        const data = await response.json();
        console.log('API Response:', data); // Debug line

        if (Array.isArray(data) && data[0]?.generated_text) {
            return data[0].generated_text;
        } else {
            console.log('Falling back to default responses');
            return getFallbackResponse(message);
        }
    } catch (error) {
        console.error('API Error:', error);
        return getFallbackResponse(message);
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