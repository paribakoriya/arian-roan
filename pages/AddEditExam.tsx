
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useExams } from '../hooks/useExams';
import { Exam, ExamCategory, Attachment } from '../types';
import { EXAM_CATEGORIES } from '../constants';
import { NavIcon } from '../components/Icons';

const AddEditExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getExam, addExam, updateExam } = useExams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'status'> & { attachments: (File | Attachment)[] }>({
    examName: '',
    category: ExamCategory.OTHERS,
    applicationNo: '',
    registrationNo: '',
    applyDate: '',
    lastDate: '',
    admitCardDate: '',
    prelimsDate: '',
    mainsDate: '',
    resultDate: '',
    notes: '',
    attachments: [],
  });
  
  const [scheduleReminders, setScheduleReminders] = useState(true);

  useEffect(() => {
    if (isEditing && id) {
      const exam = getExam(id);
      if (exam) {
        setFormData({
            ...exam,
            applyDate: exam.applyDate ? exam.applyDate.split('T')[0] : '',
            lastDate: exam.lastDate ? exam.lastDate.split('T')[0] : '',
            admitCardDate: exam.admitCardDate ? exam.admitCardDate.split('T')[0] : '',
            prelimsDate: exam.prelimsDate ? exam.prelimsDate.split('T')[0] : '',
            mainsDate: exam.mainsDate ? exam.mainsDate.split('T')[0] : '',
            resultDate: exam.resultDate ? exam.resultDate.split('T')[0] : '',
        });
      }
    }
  }, [id, isEditing, getExam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...Array.from(e.target.files!)] }));
    }
  };
  
  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.examName) {
      alert("Exam Name is required.");
      return;
    }
    
    if (isEditing && id) {
      // In update, attachments can be File or existing Attachment objects
      const attachmentsToUpdate = formData.attachments;
      const { attachments, ...rest } = formData;
      await updateExam(id, {...rest, attachments: attachmentsToUpdate});
    } else {
      // In add, attachments are only Files
      const attachmentsToAdd = formData.attachments.filter(a => a instanceof File) as File[];
      const { attachments, ...rest } = formData;
      await addExam({...rest, attachments: attachmentsToAdd});
    }
    if (scheduleReminders) {
        console.log("Scheduling reminders...");
    }
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={isEditing ? `/exam/${id}` : '/'} className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 mb-4">
        <NavIcon icon="back" className="w-4 h-4 mr-2" />
        Back to {isEditing ? 'Details' : 'Dashboard'}
      </Link>
      <h1 className="text-3xl font-bold mb-6">{isEditing ? 'Edit Exam' : 'Add New Exam'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        {/* Core Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="examName" className="block text-sm font-medium">Exam Name *</label>
            <input type="text" name="examName" id="examName" value={formData.examName} onChange={handleChange} required className="mt-1 block w-full input-style" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium">Category</label>
            <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full input-style">
              {EXAM_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="applicationNo" className="block text-sm font-medium">Application Number</label>
            <input type="text" name="applicationNo" id="applicationNo" value={formData.applicationNo} onChange={handleChange} className="mt-1 block w-full input-style" />
          </div>
          <div>
            <label htmlFor="registrationNo" className="block text-sm font-medium">Registration Number</label>
            <input type="text" name="registrationNo" id="registrationNo" value={formData.registrationNo} onChange={handleChange} className="mt-1 block w-full input-style" />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="applyDate" className="block text-sm font-medium">Apply Date</label>
            <input type="date" name="applyDate" id="applyDate" value={formData.applyDate} onChange={handleChange} className="mt-1 block w-full input-style" />
          </div>
          <div>
            <label htmlFor="lastDate" className="block text-sm font-medium">Last Date</label>
            <input type="date" name="lastDate" id="lastDate" value={formData.lastDate} onChange={handleChange} className="mt-1 block w-full input-style" />
          </div>
           <div>
            <label htmlFor="admitCardDate" className="block text-sm font-medium">Admit Card Date</label>
            <input type="date" name="admitCardDate" id="admitCardDate" value={formData.admitCardDate} onChange={handleChange} className="mt-1 block w-full input-style" />
          </div>
          <div>
            <label htmlFor="prelimsDate" className="block text-sm font-medium">Prelims Date</label>
            <input type="date" name="prelimsDate" id="prelimsDate" value={formData.prelimsDate} onChange={handleChange} className="mt-1 block w-full input-style" />
          </div>
          <div>
            <label htmlFor="mainsDate" className="block text-sm font-medium">Mains Date</label>
            <input type="date" name="mainsDate" id="mainsDate" value={formData.mainsDate} onChange={handleChange} className="mt-1 block w-full input-style" />
          </div>
          <div>
            <label htmlFor="resultDate" className="block text-sm font-medium">Result Date</label>
            <input type="date" name="resultDate" id="resultDate" value={formData.resultDate} onChange={handleChange} className="mt-1 block w-full input-style" />
          </div>
        </div>

        {/* Notes and Attachments */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
          <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={4} className="mt-1 block w-full input-style"></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium">Attachments</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <NavIcon icon="upload" className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">PDF, PNG, JPG up to 10MB</p>
            </div>
          </div>
          {formData.attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Uploaded files:</h4>
              <ul className="mt-2 space-y-2">
                {formData.attachments.map((att, index) => (
                  <li key={index} className="flex justify-between items-center text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <span>{att.name}</span>
                    <button type="button" onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700">
                      <NavIcon icon="delete" className="w-4 h-4"/>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Reminder */}
        <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="scheduleReminders"
                name="scheduleReminders"
                type="checkbox"
                checked={scheduleReminders}
                onChange={(e) => setScheduleReminders(e.target.checked)}
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="scheduleReminders" className="font-medium">Auto-schedule reminders</label>
              <p className="text-gray-500 dark:text-gray-400">Schedule default reminders (1 day before each date).</p>
            </div>
        </div>


        <div className="flex justify-end space-x-4">
          <Link to="/" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</Link>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
            {isEditing ? 'Save Changes' : 'Save Exam'}
          </button>
        </div>
        <style>{`.input-style { border-radius: 0.375rem; border: 1px solid; --tw-border-opacity: 1; border-color: rgb(209 213 219 / var(--tw-border-opacity)); padding: 0.5rem 0.75rem; background-color: transparent; } .dark .input-style { border-color: rgb(75 85 99 / var(--tw-border-opacity)); } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); --tw-ring-opacity: 1; --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity)); }`}</style>
      </form>
    </div>
  );
};

export default AddEditExam;
