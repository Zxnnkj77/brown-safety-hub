
export type TabType = 'hub' | 'map' | 'history' | 'report';

export interface Incident {
  id: string;
  type: string;
  location: string;
  reports: number;
  risk: 'High' | 'Medium' | 'Analyzing';
  confidence: number;
  time: string;
  description?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  subtitle: string;
  status: 'Active' | 'Investigated' | 'Completed' | 'Fulfilled' | 'Scheduled';
  date: string;
  icon: string;
  color: string;
}
