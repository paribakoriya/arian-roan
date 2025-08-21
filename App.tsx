
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddEditExam from './pages/AddEditExam';
import ExamDetails from './pages/ExamDetails';
import CalendarView from './pages/CalendarView';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import { ExamProvider } from './hooks/useExams';
import { NavIcon } from './components/Icons';

const navLinks = [
  { path: '/', label: 'Dashboard', icon: 'home' },
  { path: '/calendar', label: 'Calendar', icon: 'calendar' },
  { path: '/documents', label: 'Documents', icon: 'document' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

const App: React.FC = () => {
  return (
    <ExamProvider>
      <HashRouter>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          <AppContent />
        </div>
      </HashRouter>
    </ExamProvider>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <aside className="w-16 md:w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-4 border-b border-gray-200 dark:border-gray-700">
          <NavIcon icon="logo" className="h-8 w-8 text-primary-500" />
          <span className="hidden md:inline ml-3 text-lg font-bold">Exam Manager</span>
        </div>
        <nav className="flex-1 py-4">
          <ul>
            {navLinks.map(({ path, label, icon }) => (
              <li key={path} className="px-2">
                <Link
                  to={path}
                  className={`flex items-center justify-center md:justify-start p-3 my-1 rounded-lg transition-colors ${
                    location.pathname === path
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <NavIcon icon={icon as any} className="h-6 w-6" />
                  <span className="hidden md:inline ml-4">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddEditExam />} />
            <Route path="/edit/:id" element={<AddEditExam />} />
            <Route path="/exam/:id" element={<ExamDetails />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </>
  );
};

export default App;
