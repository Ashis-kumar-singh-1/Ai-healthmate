
import React from 'react';
import type { Hospital, Language } from '@/types';
import { STRINGS } from '@/constants';

interface HospitalCardProps {
    hospital: Hospital;
    language: Language;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({ hospital, language }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col justify-between transition-transform hover:scale-105">
            <div>
                <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">{hospital.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{hospital.address}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">~ {hospital.distance}</p>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ", " + hospital.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-600 transition-colors"
                >
                    {STRINGS[language].viewDirections}
                </a>
                <a 
                    href={`tel:${hospital.phone}`}
                    className="flex-1 text-center bg-green-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-600 transition-colors"
                >
                    {STRINGS[language].callNow} ({hospital.phone})
                </a>
            </div>
        </div>
    );
};
