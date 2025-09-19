
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import type { ChatMessage, Language, SymptomAnalysis, ReportSummaryData, ApiImage, Hospital } from '../types';
import { STRINGS } from '../constants';

// The API key is sourced from environment variables and is assumed to be present as per deployment configuration.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = "gemini-2.5-flash";

const getSystemPrompt = (language: Language): string => `You are HealthMate AI, a friendly and supportive healthcare assistant. Your language is ${language === 'en' ? 'English' : 'Hindi'}. 
You MUST follow these rules:
1. NEVER provide a medical diagnosis. Always state you are not a doctor.
2. Keep responses short, clear, conversational, and use emojis (🩺🍎🥦🏥⚠).
3. When given a list of hospitals, format it clearly using emojis (🏥📍⭐) as per instructions. Do not add any information not provided in the list.
4. For symptom analysis, you MUST use the provided JSON schema.
5. For medical report summarization, you MUST use the provided JSON schema.
6. If a user uploads an irrelevant file, respond with: "${STRINGS[language].fileNotSupported}".`;

const symptomAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        possibleCauses: { type: Type.STRING, description: 'A brief, conversational paragraph suggesting 2-3 possible causes. START WITH A FRIENDLY GREETING. DO NOT diagnose.' },
        urgencyLevel: { type: Type.STRING, description: 'A short description of the urgency level in the selected language.' },
        urgency: { type: Type.STRING, enum: ['Non-Urgent', 'Semi-Urgent', 'Emergency'] },
        lifestyleAdjustments: { type: Type.STRING, description: 'A short, actionable list (1-3 points) of potential lifestyle adjustments or preventive measures related to the symptoms. Frame these as general wellness tips.' }
    },
    required: ['possibleCauses', 'urgencyLevel', 'urgency'],
};

const reportSummarySchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: 'A simple, one-paragraph summary of the key findings in the selected language.' },
        findings: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    testName: { type: Type.STRING },
                    value: { type: Type.STRING },
                    trend: { type: Type.STRING, enum: ['↑', '↓', ' '], description: 'Use up arrow for increase, down for decrease, space for stable/no data' },
                    status: { type: Type.STRING, enum: ['Normal', 'Abnormal'] },
                },
                required: ['testName', 'value', 'trend', 'status'],
            },
        },
    },
    required: ['summary', 'findings'],
};

const hospitalListSchema = {
    type: Type.OBJECT,
    properties: {
        hospitals: {
            type: Type.ARRAY,
            description: "A list of nearby hospitals.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the hospital." },
                    address: { type: Type.STRING, description: "The full address of the hospital." },
                    phone: { type: Type.STRING, description: "The contact phone number of the hospital." },
                },
                required: ['name', 'address', 'phone'],
            },
        },
    },
    required: ['hospitals'],
};

// Define the expected shape of the parsed JSON from the hospitals API for type safety.
type HospitalApiResponse = {
    hospitals?: Hospital[];
};

export const findNearbyHospitals = async (lat: number, lon: number, language: Language): Promise<Hospital[]> => {
    const prompt = `Find up to 5 hospitals, clinics, or emergency rooms near latitude ${lat} and longitude ${lon}. Provide their name, full address, and a contact phone number.`;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: getSystemPrompt(language),
                responseMimeType: 'application/json',
                responseSchema: hospitalListSchema,
            }
        });

        // Safely access the response text. It might be undefined if the API call fails or returns no content.
        const responseText = response.text;
        if (!responseText) {
            console.error("Gemini API returned no text for hospital search.");
            return []; // Return an empty array if no text is received, preventing a crash.
        }

        // The outer try/catch will handle potential JSON parsing errors if the response is not valid JSON.
        const parsedResponse: HospitalApiResponse = JSON.parse(responseText);

        // Return the hospitals array, or an empty array if the 'hospitals' key doesn't exist.
        return parsedResponse.hospitals || [];
    } catch (error) {
        console.error("Error fetching or parsing hospitals from Gemini:", error);
        return [];
    }
};

export const formatHospitalList = async (hospitals: Hospital[], language: Language): Promise<string> => {
    const hospitalData = JSON.stringify(hospitals);
    const prompt = `A user speaking ${language} needs a list of nearby hospitals. Here is the data: ${hospitalData}. Please format this into a user-friendly list.
    
    Formatting rules:
    - The list is already sorted by proximity, so present them in this order.
    - For each hospital, create an entry.
    - The first line of the entry must contain: 🏥 emoji, the hospital's name in bold (using markdown), the distance, and if a rating is available, the ⭐ emoji followed by the rating.
    - The second line of the entry must contain: 📍 emoji, followed by the address.
    - Separate each hospital entry with a newline.
    - Do not add any text before or after the list. Just return the formatted list.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: getSystemPrompt(language),
        }
    });

    // Safely return the text, or an empty string if it's undefined, to prevent downstream errors.
    return response.text ?? '';
};

export const analyzeSymptoms = async (text: string, language: Language): Promise<SymptomAnalysis> => {
    const prompt = `A user has described their symptoms: "${text}". Analyze these symptoms to provide possible causes, an urgency level, and potential lifestyle adjustments or preventive measures related to the symptoms.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents:prompt,
        config: {
            systemInstruction: getSystemPrompt(language),
            responseMimeType: 'application/json',
            responseSchema: symptomAnalysisSchema
        }
    });

    // Safely get the response text.
    const responseText = response.text;
    if (!responseText) {
        // If the API returns no text, throw an error to be caught by the calling function.
        throw new Error("Failed to get a valid response from the AI for symptom analysis.");
    }

    // The calling function (`handleSendMessage`) has a try/catch, so JSON.parse errors will be handled there.
    return JSON.parse(responseText) as SymptomAnalysis;
};

export const summarizeReport = async (text: string, image: ApiImage, language: Language): Promise<ReportSummaryData> => {
    const textPart = { text: `Summarize this medical report. User comment: "${text || 'Please summarize.'}"` };
    const imagePart = { inlineData: { mimeType: image.mimeType, data: image.data }};

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: { parts: [textPart, imagePart] },
        config: {
            systemInstruction: getSystemPrompt(language),
            responseMimeType: 'application/json',
            responseSchema: reportSummarySchema,
        }
    });
    
    // Safely get the response text.
    const responseText = response.text;
    if (!responseText) {
        // If the API returns no text, throw an error to be caught by the calling function.
        throw new Error("Failed to get a valid response from the AI for report summary.");
    }
    
    // JSON.parse errors will be caught by the calling function's try/catch block.
    return JSON.parse(responseText) as ReportSummaryData;
};

export const getGeneralResponse = async (text: string, language: Language, history: ChatMessage[]): Promise<string> => {
    const chatHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    const chat: Chat = ai.chats.create({
        model,
        config: { systemInstruction: getSystemPrompt(language) },
        history: chatHistory
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: text });

    // Safely return the text from the chat response, or an empty string if it's undefined.
    return response.text ?? '';
};
