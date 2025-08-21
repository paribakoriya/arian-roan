
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useExams } from '../hooks/useExams';
import { Exam } from '../types';
import { formatDate } from '../utils/dateUtils';
import { NavIcon } from '../components/Icons';
import { getStudyTipsStream } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

const DetailItem: React.FC<{ label: string; value?: string | React.ReactNode }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
  );
};

const ExamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getExam, deleteExam } = useExams();
  const [exam, setExam] = useState<Exam | null>(null);

  const [aiTips, setAiTips] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  
  useEffect(() => {
    if (id) {
      const foundExam = getExam(id);
      setExam(foundExam || null);
    }
  }, [id, getExam]);

  const handleDelete = () => {
    if (id) {
      deleteExam(id);
      navigate('/');
    }
  };

  const handleGenerateTips = async () => {
    if (!exam) return;
    setIsGenerating(true);
    setAiTips('');
    setAiError('');
    try {
      const stream = await getStudyTipsStream(exam.examName, exam.category);
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setAiTips(prev => prev + chunkText);
      }
    } catch (error) {
        if (error instanceof Error) {
            setAiError(error.message);
        } else {
            setAiError("An unknown error occurred.");
        }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!exam) {
    return <div>Exam not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 mb-4">
        <NavIcon icon="back" className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{exam.examName}</h1>
          <p className="text-md text-gray-500 dark:text-gray-400">{exam.category}</p>
        </div>
        <div className="flex space-x-2">
          <Link to={`/edit/${exam.id}`} className="flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600">
            <NavIcon icon="edit" className="w-4 h-4 mr-2" /> Edit
          </Link>
          <button onClick={handleDelete} className="flex items-center px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800">
            <NavIcon icon="delete" className="w-4 h-4 mr-2" /> Delete
          </button>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium">Exam Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Personal details and application dates.</p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <DetailItem label="Application No." value={exam.applicationNo} />
            <DetailItem label="Registration No." value={exam.registrationNo} />
            <DetailItem label="Status" value={<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exam.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{exam.status}</span>} />
            <DetailItem label="Apply Date" value={formatDate(exam.applyDate)} />
            <DetailItem label="Last Date" value={formatDate(exam.lastDate)} />
            <DetailItem label="Admit Card Date" value={formatDate(exam.admitCardDate)} />
            <DetailItem label="Prelims Date" value={formatDate(exam.prelimsDate)} />
            <DetailItem label="Mains Date" value={formatDate(exam.mainsDate)} />
            <DetailItem label="Result Date" value={formatDate(exam.resultDate)} />
            <DetailItem label="Notes" value={<p className="whitespace-pre-wrap">{exam.notes}</p>} />
            <DetailItem label="Attachments" value={
              exam.attachments.length > 0 ? (
                <ul className="border border-gray-200 dark:border-gray-600 rounded-md divide-y divide-gray-200 dark:divide-gray-600">
                  {exam.attachments.map((att, i) => (
                    <li key={i} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <NavIcon icon="document" className="flex-shrink-0 h-5 w-5 text-gray-400" />
                        <span className="ml-2 flex-1 w-0 truncate">{att.name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a href={att.dataUrl} download={att.name} className="font-medium text-primary-600 hover:text-primary-500">
                          Download
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : "No attachments"
            } />
          </dl>
        </div>
      </div>
      
      {/* AI Study Tips */}
      <div className="mt-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <NavIcon icon="ai" className="h-6 w-6 text-primary-500 mr-3" />
                  <h3 className="text-lg leading-6 font-medium">AI Study Tips</h3>
                </div>
                <button
                  onClick={handleGenerateTips}
                  disabled={isGenerating || !process.env.API_KEY}
                  className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isGenerating ? 'Generating...' : 'Generate Tips'}
                </button>
              </div>
              {!process.env.API_KEY && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Gemini API key is not configured. This feature is disabled.</p>}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
              {isGenerating && <div className="animate-pulse">Generating tips...</div>}
              {aiError && <div className="text-red-500">{aiError}</div>}
              {aiTips && <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiTips.replace(/\n/g, '<br />') }} />}
          </div>
      </div>

    </div>
  );
};

export default ExamDetails;
