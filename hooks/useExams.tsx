import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Exam, ExamStatus, Attachment } from '../types';

interface ExamContextType {
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'status'> & { attachments: File[] }) => void;
  updateExam: (id: string, exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'status'> & { attachments: (File | Attachment)[] }) => void;
  deleteExam: (id: string) => void;
  getExam: (id: string) => Exam | undefined;
  loading: boolean;
  importExams: (newExams: Exam[]) => void;
  clearAllExams: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const fileToAttachment = (file: File): Promise<Attachment> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({
      name: file.name,
      type: file.type,
      dataUrl: reader.result as string,
    });
    reader.onerror = error => reject(error);
  });
};

export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedExams = localStorage.getItem('exams');
      if (storedExams) {
        setExams(JSON.parse(storedExams));
      }
    } catch (error) {
      console.error("Failed to load exams from local storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('exams', JSON.stringify(exams));
      } catch (error) {
        console.error("Failed to save exams to local storage", error);
      }
    }
  }, [exams, loading]);

  const addExam = useCallback(async (examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'status'> & { attachments: File[] }) => {
    const newAttachments = await Promise.all(examData.attachments.map(fileToAttachment));
    const newExam: Exam = {
      ...examData,
      id: new Date().toISOString() + Math.random(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: ExamStatus.UPCOMING,
      attachments: newAttachments,
    };
    setExams(prev => [...prev, newExam]);
    alert(`Notifications scheduled for ${examData.examName} (simulated).`);
  }, []);

  const updateExam = useCallback(async (id: string, examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'status'> & { attachments: (File | Attachment)[] }) => {
    const newAttachments = await Promise.all(examData.attachments.map(att => {
        if (att instanceof File) {
            return fileToAttachment(att);
        }
        return Promise.resolve(att as Attachment);
    }));

    setExams(prev => prev.map(exam => exam.id === id ? {
      ...exam,
      ...examData,
      attachments: newAttachments,
      updatedAt: new Date().toISOString()
    } : exam));
    alert(`Notifications rescheduled for ${examData.examName} (simulated).`);
  }, []);

  const deleteExam = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      setExams(prev => prev.filter(exam => exam.id !== id));
    }
  }, []);

  const getExam = useCallback((id: string) => {
    return exams.find(exam => exam.id === id);
  }, [exams]);
  
  const importExams = useCallback((newExams: Exam[]) => {
    setExams(prev => [...prev, ...newExams]);
  }, []);

  const clearAllExams = useCallback(() => {
    if (window.confirm("Are you sure you want to delete ALL exam data? This cannot be undone.")) {
      setExams([]);
    }
  }, []);

  return (
    <ExamContext.Provider value={{ exams, addExam, updateExam, deleteExam, getExam, loading, importExams, clearAllExams }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExams = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExams must be used within an ExamProvider');
  }
  return context;
};
