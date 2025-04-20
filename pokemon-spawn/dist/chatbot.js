import { HF_API_TOKEN, SYSTEM_PROMPT } from './config.js';

async function getChatbotResponse(message) {
    const API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large";
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "inputs": `${SYSTEM_PROMPT}\n\nUser: ${message}\nAssistant: Let me explain using Pokemon examples!`
            }),
        });

        const data = await response.json();
        return data[0].generated_text || getFallbackResponse(message);
    } catch (error) {
        console.error('Error:', error);
        return getFallbackResponse(message);
    }
}

function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('variable')) {
        return "Variables are like Pokéballs! Just as Pokéballs store different Pokemon, variables store different types of data.\n\nFor example:\nString pokemonName = \"Pikachu\";\nint level = 25;\nboolean isElectricType = true;\n\nEach variable holds its own piece of data, just like each Pokéball holds its own Pokemon!";
    }
    if (lowerMessage.includes('string')) {
        return "Strings are like Pokémon names - text wrapped in quotes! Example:\nString trainerName = \"Ash\";";
    }
    if (lowerMessage.includes('number')) {
        return "Numbers are like Pokémon stats - they can be stored in variables!\nint hp = 100;\ndouble speed = 90.5;";
    }
    return "Try asking about variables, strings, or numbers in programming!";
}

export { getChatbotResponse };