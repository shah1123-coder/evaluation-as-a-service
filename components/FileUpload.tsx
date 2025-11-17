'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';

interface ParsedItem {
  prompt: string;
  expected_output?: string;
  model_output: string;
}

interface FileUploadProps {
  onDataParsed: (data: ParsedItem[]) => void;
}

export default function FileUpload({ onDataParsed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setFileName(file.name);

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const items = results.data.map((row: any) => {
              if (!row.prompt || !row.model_output) {
                throw new Error('CSV must contain "prompt" and "model_output" columns');
              }
              return {
                prompt: row.prompt,
                expected_output: row.expected_output || undefined,
                model_output: row.model_output,
              };
            });
            onDataParsed(items);
          } catch (err: any) {
            setError(err.message);
          }
        },
        error: (err) => {
          setError(`Failed to parse CSV: ${err.message}`);
        },
      });
    } else if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          const items = Array.isArray(json) ? json : [json];
          
          items.forEach((item) => {
            if (!item.prompt || !item.model_output) {
              throw new Error('JSON items must contain "prompt" and "model_output" fields');
            }
          });
          
          onDataParsed(items);
        } catch (err: any) {
          setError(`Failed to parse JSON: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a CSV or JSON file');
    }
  }, [onDataParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {fileName || 'Drop your dataset here or click to browse'}
          </p>
          <p className="text-sm text-gray-500">
            Supports CSV and JSON files
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Required fields: prompt, model_output (expected_output is optional)
          </p>
        </label>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

