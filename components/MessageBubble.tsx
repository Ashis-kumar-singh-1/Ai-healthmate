
import React from 'react';
import type { ChatMessage } from '@/types';
import { ReportSummary } from '@/components/ReportSummary';
import { STRINGS } from '@/constants';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white self-end'
    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 self-start';
  
  const language = document.documentElement.lang === 'hi' ? 'hi' : 'en';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md md:max-w-lg lg:max-w-2xl rounded-xl p-4 shadow-md ${bubbleClasses}`}>
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
        {message.fileInfo && (
          <div className="mt-2 text-sm text-gray-400 dark:text-gray-500 italic">
            📎 {message.fileInfo.name}
          </div>
        )}
        {message.report && message.report.length > 0 && (
            <ReportSummary findings={message.report} language={language} />
        )}
        {message.urgency === 'Emergency' && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500 text-red-700 dark:text-red-300 rounded-lg">
                <h3 className="font-bold text-lg">{STRINGS[language].emergencyAlert}</h3>
                <p>{STRINGS[language].callEmergency}</p>
            </div>
        )}
      </div>
    </div>
  );
};
