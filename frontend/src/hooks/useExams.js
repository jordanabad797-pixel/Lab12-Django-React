import { useCallback, useEffect, useState } from 'react';
import { listExams } from '../api/exams.js';
import { parseApiError } from '../api/errors.js';

/**
 * Loads a page of exams and exposes the three states of the request:
 * isLoading (loading), data (success) and error (failure).
 */
export function useExams({ page, search }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Aborting avoids updating state from an old request (page changes,
    // unmount, React StrictMode double effect).
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    listExams({ page, search, signal: controller.signal })
      .then((payload) => setData(payload))
      .catch((err) => {
        const parsed = parseApiError(err);
        if (parsed) {
          setError(parsed);
          setData(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [page, search, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, isLoading, error, reload };
}
