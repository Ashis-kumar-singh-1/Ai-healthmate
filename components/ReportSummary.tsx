
import React from 'react';
import type { ReportFinding, Language } from '@/types';
import { STRINGS } from '@/constants';

interface ReportSummaryProps {
  findings: ReportFinding[];
  language: Language;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ findings, language }) => {
  return (
    <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-inner">
      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{STRINGS[language].reportSummaryTitle}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-2">{STRINGS[language].testName}</th>
              <th scope="col" className="px-4 py-2">{STRINGS[language].value}</th>
              <th scope="col" className="px-4 py-2">{STRINGS[language].trend}</th>
              <th scope="col" className="px-4 py-2">{STRINGS[language].status}</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((finding, index) => (
              <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{finding.testName}</td>
                <td className="px-4 py-2">{finding.value}</td>
                <td className="px-4 py-2 text-center">{finding.trend}</td>
                <td className={`px-4 py-2 ${finding.status === 'Abnormal' ? 'text-red-500 font-semibold' : ''}`}>
                  {finding.status === 'Abnormal' && '⚠ '}{finding.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
