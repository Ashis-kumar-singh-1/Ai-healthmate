
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'hi';
export type Sender = 'user' | 'ai';

export type Urgency = 'Non-Urgent' | 'Semi-Urgent' | 'Emergency';

export interface ChatMessage {
  id: number;
  sender: Sender;
  text: string;
  fileInfo?: { name: string; type: string };
  urgency?: Urgency;
  report?: ReportFinding[];
}

export interface ReportFinding {
  testName: string;
  value: string;
  trend: '↑' | '↓' | ' ';
  status: 'Normal' | 'Abnormal';
}

export interface SymptomAnalysis {
  possibleCauses: string;
  urgencyLevel: string;
  urgency: Urgency;
  lifestyleAdjustments?: string;
}

export interface ReportSummaryData {
    summary: string;
    findings: ReportFinding[];
}

export interface ApiImage {
    mimeType: string;
    data: string;
}

export interface Hospital {
    name: string;
    address: string;
    distance?: string;
    phone: string;
    rating?: number;
}