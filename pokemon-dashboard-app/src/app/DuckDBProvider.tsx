'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import { initDuckDB } from '@/lib/duckdb';

interface DuckDBContextType {
  db: duckdb.AsyncDuckDB | null;
  loading: boolean;
  error: Error | null;
}

const DuckDBContext = createContext<DuckDBContextType>({ db: null, loading: true, error: null });

export function DuckDBProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initDuckDB()
      .then(setDb)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DuckDBContext.Provider value={{ db, loading, error }}>
      {children}
    </DuckDBContext.Provider>
  );
}

export const useDuckDB = () => useContext(DuckDBContext);
