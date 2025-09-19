
import React from 'react';
import type { Language } from '../types';
import { STRINGS } from '../constants';

interface DisclaimerProps {
    language: Language;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ language }) => {
  return (
    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
      ⚠️ {STRINGS[language].disclaimer}
    </p>
  );
};
