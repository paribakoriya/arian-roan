
export enum ExamCategory {
  BANK = "Bank",
  SSC = "SSC",
  UPSC = "UPSC",
  PSC = "PSC",
  RAILWAY = "Railway",
  OTHERS = "Others",
}

export enum ExamStatus {
  UPCOMING = "Upcoming",
  ONGOING = "Ongoing",
  COMPLETED = "Completed",
  EXPIRED = "Expired",
}

export interface Attachment {
  name: string;
  type: string;
  dataUrl: string; // Base64 encoded file content
}

export interface Exam {
  id: string;
  examName: string;
  category: ExamCategory;
  applicationNo?: string;
  registrationNo?: string;
  applyDate?: string;
  lastDate?: string;
  admitCardDate?: string;
  prelimsDate?: string;
  mainsDate?: string;
  resultDate?: string;
  notes?: string;
  attachments: Attachment[];
  status: ExamStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  examId: string;
  examName: string;
  type: 'Last Date' | 'Admit Card' | 'Prelims' | 'Mains' | 'Result';
  date: string;
}
