
import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon } from '@/components/icons/UploadIcon';
import { MicrophoneIcon } from '@/components/icons/MicrophoneIcon';
import { SendIcon } from '@/components/icons/SendIcon';
import { Tooltip } from '@/components/Tooltip';
import type { Language } from '@/types';
import { STRINGS } from '@/constants';

interface TextInputProps {
  onSendMessage: (text: string, file?: File) => void;
  isLoading: boolean;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  language: Language;
}

export const TextInput: React.FC<TextInputProps> = ({
  onSendMessage,
  isLoading,
  isListening,
  startListening,
  stopListening,
  transcript,
  language
}) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  const handleSend = () => {
    if (isLoading) return;
    onSendMessage(text, file);
    setText('');
    setFile(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col gap-2">
        {file && (
            <div className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                <span className="font-medium">📎 {file.name}</span>
                <button onClick={() => setFile(undefined)} className="text-red-500 hover:text-red-700">&times;</button>
            </div>
        )}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Tooltip text={language === 'en' ? 'Upload Report' : 'रिपोर्ट अपलोड करें'}>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                disabled={isLoading}
            >
                <UploadIcon />
            </button>
            </Tooltip>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg,.jpeg,.png,.txt"
            />
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                    }
                }}
                placeholder={isListening ? STRINGS[language].listening : STRINGS[language].inputPlaceholder}
                className="flex-1 bg-transparent focus:outline-none resize-none"
                rows={1}
                disabled={isLoading}
            />
            <Tooltip text={isListening ? (language === 'en' ? 'Stop Listening' : 'सुनना बंद करें') : (language === 'en' ? 'Voice Input' : 'आवाज से लिखें')}>
                <button
                    onClick={handleMicClick}
                    className={`p-2 rounded-full transition-colors ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    disabled={isLoading}
                >
                    <MicrophoneIcon />
                </button>
            </Tooltip>
            <Tooltip text={language === 'en' ? 'Send' : 'भेजें'}>
            <button
                onClick={handleSend}
                disabled={isLoading || (!text && !file)}
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                <SendIcon />
                )}
            </button>
            </Tooltip>
        </div>
    </div>
  );
};
