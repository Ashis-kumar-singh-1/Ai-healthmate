
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ChatInterface } from '@/components/ChatInterface';
import { TextInput } from '@/components/TextInput';
import { Disclaimer } from '@/components/Disclaimer';
import { analyzeSymptoms, summarizeReport, getGeneralResponse, formatHospitalList, findNearbyHospitals } from '@/app/actions';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { useSpeech } from '@/hooks/useSpeech';
import { fileToBase64 } from '@/utils/fileUtils';
import type { ChatMessage, Language, Hospital } from '@/types';
import { WELCOME_MESSAGES, STRINGS } from '@/constants';

const HomePage: React.FC = () => {
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
          sender