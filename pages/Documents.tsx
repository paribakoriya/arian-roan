
import React, { useMemo } from 'react';
import { useExams } from '../hooks/useExams';
import { Attachment, Exam } from '../types';
import { NavIcon } from '../components/Icons';

interface Document extends Attachment {
  examId: string;
  examName: string;
}

const Documents: React.FC = () => {
  const { exams, importExams } = useExams();

  const allDocuments = useMemo<Document[]>(() => {
    return exams.flatMap(exam => 
      exam.attachments.map(att => ({
        ...att,
        examId: exam.id,
        examName: exam.examName,
      }))
    );
  }, [exams]);
  
  const exportToCSV = () => {
    if (exams.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = Object.keys(exams[0]).filter(k => k !== 'attachments').join(',');
    const rows = exams.map(exam => {
      const { attachments, ...rest } = exam;
      return Object.values(rest).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exams_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;

      try {
        const rows = text.split('\n').filter(row => row);
        const headers = rows.shift()?.split(',').map(h => h.replace(/"/g, '')) ?? [];
        
        const importedExams: Exam[] = rows.map(row => {
          const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/"/g, '')) ?? [];
          const examObject: any = {};
          headers.forEach((header, index) => {
            examObject[header] = values[index];
          });
          // Add required fields if missing
          examObject.attachments = examObject.attachments || [];
          return examObject as Exam;
        });
        importExams(importedExams);
        alert(`${importedExams.length} exams imported successfully.`);
      } catch (error) {
        alert("Failed to parse CSV file. Please check the format.");
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Documents & Exports</h1>
      
      {/* Export/Import Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Data Management</h2>
        <div className="flex flex-wrap gap-4">
          <button onClick={exportToCSV} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600">
            <NavIcon icon="download" className="w-4 h-4 mr-2" /> Export All to CSV
          </button>
          
          <label className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 cursor-pointer">
            <NavIcon icon="upload" className="w-4 h-4 mr-2" /> Import from CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">All Documents</h2>
        {allDocuments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Associated Exam</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {allDocuments.map((doc, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{doc.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{doc.examName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <a href={doc.dataUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Preview</a>
                       <a href={doc.dataUrl} download={doc.name} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Download</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No documents have been uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Documents;
