
import React from 'react';
import type { Theme, Language } from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { HospitalIcon } from './icons/HospitalIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { Tooltip } from './Tooltip';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  onFindHospitals: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, setTheme, language, setLanguage, onFindHospitals }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
        HealthMate AI 🩺
      </h1>
      <div className="flex items-center space-x-2 md:space-x-4">
        <Tooltip text={language === 'en' ? 'Find Hospitals' : 'अस्पताल खोजें'}>
          <button
            onClick={onFindHospitals}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <HospitalIcon />
          </button>
        </Tooltip>
        <Tooltip text={language === 'en' ? 'Switch Language' : 'भाषा बदलें'}>
            <button
                onClick={toggleLanguage}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <LanguageIcon />
            </button>
        </Tooltip>
        <Tooltip text={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
