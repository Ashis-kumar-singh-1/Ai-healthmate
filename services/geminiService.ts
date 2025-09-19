
import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, Language, SymptomAnalysis, ReportSummaryData, ApiImage, Hospital } from '../types';
import { STRINGS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = "gemini-2.5-flash";

const getSystemPrompt = (language: Language) => `You are HealthMate AI, a friendly and supportive healthcare assistant. Your language is ${language === 'en' ? 'English' : 'Hindi'}. 
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
            },
        },
    },
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

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: getSystemPrompt(language),
        }
    });

    return response.text;
};

export const analyzeSymptoms = async (text: string, language: Language): Promise<SymptomAnalysis> => {
    const prompt = `A user has described their symptoms: "${text}". Analyze these symptoms to provide possible causes, an urgency level, and potential lifestyle adjustments or preventive measures related to the symptoms.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: getSystemPrompt(language),
            responseMimeType: 'application/json',
            responseSchema: symptomAnalysisSchema
        }
    });
    return JSON.parse(response.text) as SymptomAnalysis;
};

export const summarizeReport = async (text: string, image: ApiImage, language: Language): Promise<ReportSummaryData> => {
    const textPart = { text: `Summarize this medical report. User comment: "${text || 'Please summarize.'}"` };
    const imagePart = { inlineData: { mimeType: image.mimeType, data: image.data }};

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [textPart, imagePart] },
        config: {
            systemInstruction: getSystemPrompt(language),
            responseMimeType: 'application/json',
            responseSchema: reportSummarySchema,
        }
    });
    return JSON.parse(response.text) as ReportSummaryData;
};

export const getGeneralResponse = async (text: string, language: Language, history: ChatMessage[]): Promise<string> => {
    const chatHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
        model,
        config: { systemInstruction: getSystemPrompt(language) },
        history: chatHistory
    });

    const response = await chat.sendMessage({ message: text });
    return response.text;
};