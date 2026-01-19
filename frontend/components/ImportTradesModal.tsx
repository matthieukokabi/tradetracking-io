"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";

interface ImportTradesModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ImportTradesModal({ onSuccess, onCancel }: ImportTradesModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.importTrades(file);
      toast.success(result.message);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to import trades");
      setError(err.message || "Failed to import trades");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-semibold mb-2">CSV Format Requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Columns needed: Symbol, Side, Quantity, Price, Time</li>
          <li>Accepted headers: ticker, type, size, entry price, date, etc.</li>
          <li>Supported date formats: ISO, YYYY-MM-DD, etc.</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              file
                ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800"
                : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-900 dark:border-zinc-700 hover:dark:border-zinc-600"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <>
                  <svg className="w-8 h-8 mb-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(2)} KB</p>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 mb-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">CSV files only</p>
                </>
              )}
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !file}
            className="flex-1 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import Trades"}
          </button>
        </div>
      </form>
    </div>
  );
}
