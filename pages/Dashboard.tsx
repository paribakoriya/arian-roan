
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useExams } from '../hooks/useExams';
import { Exam, ExamStatus, TimelineEvent } from '../types';
import { NavIcon } from '../components/Icons';
import { DATE_FIELDS, DATE_FIELD_LABELS } from '../constants';
import { formatDate } from '../utils/dateUtils';

type FilterTab = 'Upcoming' | 'Ongoing' | 'Completed';

const Dashboard: React.FC = () => {
  const { exams, loading, updateExam } = useExams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('Upcoming');

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    exams.forEach(exam => {
      DATE_FIELDS.forEach(field => {
        const date = exam[field as keyof Exam] as string | undefined;
        if (date) {
          events.push({
            examId: exam.id,
            examName: exam.examName,
            type: DATE_FIELD_LABELS[field] as TimelineEvent['type'],
            date: date,
          });
        }
      });
    });
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams]);
  
  const filteredExams = useMemo(() => {
    const now = new Date();
    now.setHours(0,0,0,0);

    let filtered = exams;
    
    if (activeTab === 'Upcoming') {
        filtered = exams.filter(e => e.status === ExamStatus.UPCOMING);
    } else if (activeTab === 'Ongoing') {
        filtered = exams.filter(e => e.status === ExamStatus.ONGOING);
    } else if (activeTab === 'Completed') {
        filtered = exams.filter(e => e.status === ExamStatus.COMPLETED || e.status === ExamStatus.EXPIRED);
    }
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(exam =>
        exam.examName.toLowerCase().includes(lowerQuery) ||
        exam.applicationNo?.toLowerCase().includes(lowerQuery) ||
        exam.registrationNo?.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [exams, activeTab, searchQuery]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return timelineEvents.filter(event => new Date(event.date) >= now).slice(0, 5);
  }, [timelineEvents]);

  const handleMarkComplete = (exam: Exam) => {
      const updatedExam = { ...exam, status: ExamStatus.COMPLETED };
      const { id, createdAt, updatedAt, attachments, ...examData } = updatedExam;
      updateExam(id, { ...examData, attachments });
  };
  
  const handleSnooze = () => {
      alert("Reminder snoozed for 1 hour (simulated).");
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Search Bar */}
      <div className="relative">
        <NavIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Exam name or Application No./Reg No."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>

      {/* Upcoming Items */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Next 5 Upcoming Events</h2>
        {upcomingEvents.length > 0 ? (
          <ul className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <span className="text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">{event.type}</span>
                  <div className="ml-4">
                    <p className="font-semibold">{event.examName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleSnooze} className="p-1 text-gray-500 hover:text-primary-500" title="Snooze Reminder"><NavIcon icon="snooze" className="w-5 h-5"/></button>
                    <Link to={`/exam/${event.examId}`} className="p-1 text-gray-500 hover:text-primary-500" title="Open Details"><NavIcon icon="document" className="w-5 h-5"/></Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No upcoming events found.</p>
        )}
      </div>

      {/* Exam List */}
      <div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6">
            {(['Upcoming', 'Ongoing', 'Completed'] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map(exam => (
            <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold">{exam.examName}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${exam.status === ExamStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} dark:bg-opacity-20`}>{exam.status}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{exam.category}</p>
                {exam.lastDate && <p className="text-sm mt-2">Last Date: {formatDate(exam.lastDate)}</p>}
                {exam.prelimsDate && <p className="text-sm">Prelims: {formatDate(exam.prelimsDate)}</p>}
              </div>
              <div className="mt-4 flex space-x-2">
                <Link to={`/exam/${exam.id}`} className="flex-1 text-center bg-primary-500 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-primary-600 transition-colors">
                  Details
                </Link>
                 <button onClick={() => handleMarkComplete(exam)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600" title="Mark Completed">
                  <NavIcon icon="check" className="w-4 h-4" />
                </button>
                <Link to={`/edit/${exam.id}`} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600" title="Edit">
                  <NavIcon icon="edit" className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
          {filteredExams.length === 0 && <p className="text-gray-500 dark:text-gray-400 col-span-full">No exams found for this filter.</p>}
        </div>
      </div>
      
      <Link to="/add" className="fixed bottom-8 right-8 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform hover:scale-110">
        <NavIcon icon="add" className="h-6 w-6" />
      </Link>
    </div>
  );
};

export default Dashboard;
