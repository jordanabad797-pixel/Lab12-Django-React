import { useCallback, useEffect, useState } from 'react';
import { listExams } from '../api/exams.js';
import { parseApiError } from '../api/errors.js';

/**
 * Loads a page of exams and exposes the three states of the request:
 * isLoading (loading), data (success) and error (failure).
 */
export function useExams({ page, search }) {
  const [reloadKey, setReloadKey] = useState(0);
  // Outcome of the last finished request, tagged with the key it answered.
  const [result, setResult] = useState({ key: null, data: null, error: null });

  // Loading is derived instead of set inside the effect: while the last
  // finished request does not match the current params, a new one is pending.
  const requestKey = JSON.stringify([page, search, reloadKey]);
  const isLoading = result.key !== requestKey;

  useEffect(() => {
    // Aborting avoids updating state from an old request (page changes,
    // unmount, React StrictMode double effect).
    const controller = new AbortController();

    listExams({ page, search, signal: controller.signal })
      .then((payload) => setResult({ key: requestKey, data: payload, error: null }))
      .catch((err) => {
        const parsed = parseApiError(err);
        if (parsed) {
          setResult({ key: requestKey, data: null, error: parsed });
        }
      });

    return () => controller.abort();
  }, [page, search, requestKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  // Previous data stays visible while refreshing; a stale error does not.
  return { data: result.data, isLoading, error: isLoading ? null : result.error, reload };
}
