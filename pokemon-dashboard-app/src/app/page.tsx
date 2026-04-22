'use client';

import { useDuckDB } from './DuckDBProvider';

export default function Home() {
  const { db, loading, error } = useDuckDB();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Pokemon Dashboard
          </h1>
          
          {loading && (
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              <span>Initializing DuckDB WASM...</span>
            </div>
          )}
          
          {error && (
            <div className="text-red-500">
              Error: {error.message}
            </div>
          )}
          
          {db && !loading && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">DuckDB WASM Connected!</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
