import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { TextInput } from './components/TextInput';
import { Disclaimer } from './components/Disclaimer';
import { analyzeSymptoms, summarizeReport, getGeneralResponse, formatHospitalList } from './services/geminiService';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { useSpeech } from './hooks/useSpeech';
import { fileToBase64 } from './utils/fileUtils';
import type { ChatMessage, Language, Hospital } from './types';
import { WELCOME_MESSAGES, STRINGS } from './constants';

// Mock function to simulate fetching hospitals from an API
const fetchNearbyHospitals = async (lat: number, lon: number): Promise<Hospital[]> => {
    console.log(`Fetching hospitals near ${lat}, ${lon}`);
    // In a real app, this would be an API call to Google Places, OpenStreetMap, etc.
    // We'll return a static list for demonstration purposes.
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { name: 'City General Hospital', address: '123 Main St, Anytown', distance: '2.1 km', phone: '555-0101', rating: 4.3 },
                { name: 'Community Care Center', address: '456 Oak Ave, Anytown', distance: '3.5 km', phone: '555-0102', rating: 4.7 },
                { name: 'Sunshine Medical Clinic', address: '789 Pine Ln, Anytown', distance: '5.2 km', phone: '555-0103' },
            ]);
        }, 1000); // Simulate network delay
    });
};


const App: React.FC = () => {
  const [theme, setTheme] = useTheme();
  const [language, setLanguage] = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { isListening, transcript, startListening, stopListening, speak } = useSpeech(language);
  
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: WELCOME_MESSAGES[language],
      }
    ]);
  }, [language]);

  const handleSendMessage = useCallback(async (text: string, file?: File) => {
    if (!text && !file) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: text,
      fileInfo: file ? { name: file.name, type: file.type } : undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let aiResponse: ChatMessage;
      if (file) {
        const base64Data = await fileToBase64(file);
        const reportData = await summarizeReport(text, { mimeType: file.type, data: base64Data }, language);
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: reportData.summary,
          report: reportData.findings,
        };
      } else if (text.toLowerCase().includes(STRINGS[language].symptomKeyword)) {
        const analysis = await analyzeSymptoms(text, language);
        let responseText = `${analysis.possibleCauses}\n\n**${STRINGS[language].urgency}:** ${analysis.urgencyLevel}`;
        if (analysis.lifestyleAdjustments && analysis.lifestyleAdjustments.trim() !== '') {
            responseText += `\n\n**${STRINGS[language].lifestyleAdjustmentsTitle}:**\n${analysis.lifestyleAdjustments}`;
        }
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: responseText,
          urgency: analysis.urgency,
        };
        if (analysis.urgency === 'Emergency') {
          handleFindHospitals();
        }
      } else {
        const responseText = await getGeneralResponse(text, language, messages);
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: responseText,
        };
      }
      setMessages(prev => [...prev, aiResponse]);
      if (aiResponse.text) {
        speak(aiResponse.text);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: STRINGS[language].error,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [language, messages, speak]);

  const handleFindHospitals = () => {
    setIsLoading(true);

    const addAiMessage = (text: string) => {
        const message: ChatMessage = { id: Date.now(), sender: 'ai', text };
        setMessages(prev => [...prev, message]);
        speak(text);
    };

    if (!navigator.geolocation) {
        addAiMessage(STRINGS[language].hospitalFetchError);
        setIsLoading(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const fetchedHospitals = await fetchNearbyHospitals(latitude, longitude);

                if (fetchedHospitals && fetchedHospitals.length > 0) {
                    const intro = STRINGS[language].hospitalsFound;
                    const formattedList = await formatHospitalList(fetchedHospitals, language);
                    addAiMessage(`${intro}\n\n${formattedList}`);
                } else {
                    addAiMessage(STRINGS[language].hospitalFetchError);
                }
            } catch (error) {
                console.error("Error finding hospitals:", error);
                addAiMessage(STRINGS[language].hospitalFetchError);
            } finally {
                setIsLoading(false);
            }
        },
        () => { // error callback
            addAiMessage(STRINGS[language].hospitalFetchError);
            setIsLoading(false);
        }
    );
};

  return (
    <div className="flex flex-col h-screen font-sans transition-colors duration-300 text-gray-800 dark:text-gray-200">
      <Header
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        onFindHospitals={handleFindHospitals}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <ChatInterface messages={messages} />
      </main>
      <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <TextInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
          transcript={transcript}
          language={language}
        />
        <Disclaimer language={language} />
      </footer>
    </div>
  );
};

export default App;