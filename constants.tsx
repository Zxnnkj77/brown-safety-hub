
import React from 'react';

export const COLORS = {
  navy: '#002147',
  primary: '#be0909',
  muted: '#6B7280',
  red: '#EF4444',
  yellow: '#F59E0B',
  active: '#002147',
  inactive: '#9CA3AF',
};

export const MOCK_INCIDENTS = [
  {
    id: '1',
    type: 'Loud Sounds Reported',
    location: 'Science Library',
    reports: 4,
    risk: 'High',
    confidence: 85,
    time: '2 mins ago',
  },
  {
    id: '2',
    type: 'Medical Assistance',
    location: 'Keeney Quad',
    reports: 1,
    risk: 'Medium',
    confidence: 50,
    time: '5 mins ago',
  },
  {
    id: '3',
    type: 'Suspicious Activity',
    location: 'Main Green',
    reports: 2,
    risk: 'Analyzing',
    confidence: 30,
    time: '12 mins ago',
  }
];

export const HISTORY_DATA = [
  {
    id: 'h1',
    title: 'Severe Weather Warning',
    subtitle: 'Campus-wide alert • Shelter in place',
    status: 'Active',
    date: 'Oct 28 • 10:00 AM',
    icon: 'thunderstorm',
    color: 'bg-primary',
    border: 'border-red-100',
    statusBg: 'bg-red-50',
    statusText: 'text-primary'
  },
  {
    id: 'h2',
    title: 'Suspicious Package',
    subtitle: 'Submitted Anonymously • Student Center',
    status: 'Investigated',
    date: 'Oct 15 • 14:15',
    icon: 'package_2',
    color: 'bg-sky-500',
    border: 'border-sky-100',
    statusBg: 'bg-sky-50',
    statusText: 'text-sky-600'
  },
  {
    id: 'h3',
    title: 'Fire Drill - Library',
    subtitle: 'Mandatory evacuation practice',
    status: 'Completed',
    date: 'Oct 10 • 09:00 AM',
    icon: 'local_fire_department',
    color: 'bg-emerald-500',
    border: 'border-emerald-100',
    statusBg: 'bg-emerald-50',
    statusText: 'text-emerald-600'
  }
];
