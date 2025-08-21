
import React, { useState, useEffect } from 'react';
import { useExams } from '../hooks/useExams';

type Theme = 'light' | 'dark' | 'system';

const Settings: React.FC = () => {
  const { clearAllExams } = useExams();
  const [theme, setTheme] = useState<Theme>('system');
  
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.removeItem('theme');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const SettingCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{title}</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>{description}</p>
            </div>
            <div className="mt-5">
                {children}
            </div>
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <SettingCard title="Theme" description="Select your preferred color theme for the application.">
          <div className="flex space-x-4">
            {(['light', 'dark', 'system'] as Theme[]).map(t => (
                <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`px-4 py-2 rounded-md text-sm font-medium border ${theme === t ? 'bg-primary-500 border-primary-500 text-white' : 'bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
            ))}
          </div>
      </SettingCard>
      
      <SettingCard title="Account & Sync" description="Sign in to enable cloud sync. This is a mock-up and does not actually sync data.">
          <div className="flex items-center space-x-4">
            <button onClick={() => alert("Simulating Google Sign-In...")} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Sign in with Google</button>
            <div className="flex items-center">
                <span className="mr-2 text-sm">Auto Sync</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                    <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
            </div>
          </div>
          <style>{`.toggle-checkbox:checked { right: 0; border-color: #2563eb; } .toggle-checkbox:checked + .toggle-label { background-color: #2563eb; }`}</style>
      </SettingCard>

       <SettingCard title="Data Management" description="Manage your application data. Be careful, clearing data is permanent.">
          <button onClick={clearAllExams} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
            Clear All Data
          </button>
       </SettingCard>
       
       <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Exam Form Manager v1.0.0</p>
          <p>
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a> &middot; <a href="#" className="text-primary-600 hover:underline">Contact Us</a>
          </p>
       </div>

    </div>
  );
};

export default Settings;
