
import { ExamCategory, ExamStatus } from './types';

export const EXAM_CATEGORIES = Object.values(ExamCategory);
export const EXAM_STATUSES = Object.values(ExamStatus);

export const DATE_FIELDS: (keyof import('./types').Exam)[] = [
  'lastDate',
  'admitCardDate',
  'prelimsDate',
  'mainsDate',
  'resultDate',
];

export const DATE_FIELD_LABELS: { [key: string]: string } = {
  lastDate: 'Last Date',
  admitCardDate: 'Admit Card',
  prelimsDate: 'Prelims',
  mainsDate: 'Mains',
  resultDate: 'Result',
};
