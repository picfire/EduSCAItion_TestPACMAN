import { HF_API_TOKEN } from './config.js';

async function getChatbotResponse(message) {
    const API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "inputs": `You are Professor Oak's programming assistant. Explain this programming concept using Pokemon analogies: ${message}`
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
        return "Variables are like Pokéballs - they store different types of data! For example:\nString pokemonName = \"Pikachu\";\nint level = 25;";
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