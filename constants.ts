
import type { Language } from './types';

export const WELCOME_MESSAGES: Record<Language, string> = {
  en: "Hello! I'm HealthMate AI 🩺. How can I assist you today? You can describe your symptoms, upload a medical report, or ask for health advice.",
  hi: "नमस्ते! मैं हेल्थमेट एआई 🩺 हूँ। मैं आज आपकी कैसे सहायता कर सकता हूँ? आप अपने लक्षण बता सकते हैं, मेडिकल रिपोर्ट अपलोड कर सकते हैं, या स्वास्थ्य सलाह मांग सकते हैं।",
};

export const STRINGS: Record<Language, { [key: string]: string }> = {
    en: {
        disclaimer: "I am not a doctor. Consult a healthcare professional for medical advice.",
        inputPlaceholder: "Type your message or upload a report...",
        uploading: "Uploading...",
        listening: "Listening...",
        send: "Send",
        error: "Sorry, something went wrong. Please try again.",
        symptomKeyword: "symptom",
        urgency: "Urgency",
        hospitalsFound: "Certainly! Here are some nearby hospitals I found for you:",
        hospitalFetchError: "I couldn’t fetch nearby hospitals right now. 🚑 If this is an emergency, please call **108** immediately.",
        reportSummaryTitle: "Medical Report Summary",
        testName: "Test Name",
        value: "Value",
        trend: "Trend",
        status: "Status",
        viewDirections: "View Directions",
        callNow: "Call Now",
        fileNotSupported: "I can only read health-related reports for now 😊.",
        emergencyAlert: "🔴 EMERGENCY 🔴",
        callEmergency: "Please call 108 immediately or go to the nearest hospital.",
        lifestyleAdjustmentsTitle: "Lifestyle & Prevention Tips"
    },
    hi: {
        disclaimer: "मैं डॉक्टर नहीं हूँ। चिकित्सा सलाह के लिए किसी स्वास्थ्य पेशेवर से सलाह लें।",
        inputPlaceholder: "अपना संदेश लिखें या रिपोर्ट अपलोड करें...",
        uploading: "अपलोड हो रहा है...",
        listening: "सुन रहा हूँ...",
        send: "भेजें",
        error: "क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
        symptomKeyword: "लक्षण",
        urgency: "तत्काल आवश्यकता",
        hospitalsFound: "ज़रूर! यहाँ आपके लिए आस-पास के कुछ अस्पताल हैं:",
        hospitalFetchError: "मैं अभी आस-पास के अस्पताल नहीं ढूंढ सका। 🚑 यदि यह एक आपात स्थिति है, तो कृपया तुरंत **108** पर कॉल करें।",
        reportSummaryTitle: "मेडिकल रिपोर्ट सारांश",
        testName: "टेस्ट का नाम",
        value: "मान",
        trend: "प्रवृत्ति",
        status: "स्थिति",
        viewDirections: "दिशा-निर्देश देखें",
        callNow: "अभी कॉल करें",
        fileNotSupported: "मैं अभी के लिए केवल स्वास्थ्य-संबंधी रिपोर्ट पढ़ सकता हूँ 😊।",
        emergencyAlert: "🔴 आपातकाल 🔴",
        callEmergency: "कृपया तुरंत 108 पर कॉल करें या नजदीकी अस्पताल जाएं。",
        lifestyleAdjustmentsTitle: "जीवनशैली और रोकथाम के उपाय"
    },
};