import { useState, useCallback } from 'react';

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

interface UseAsyncReturn<T, Args extends unknown[]> {
  state: AsyncState<T>;
  execute: (...args: Args) => Promise<T | undefined>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export function useAsync<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
): UseAsyncReturn<T, Args> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setState({ status: 'loading' });
      try {
        const data = await asyncFn(...args);
        setState({ status: 'success', data });
        return data;
      } catch (err) {
        setState({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) });
        return undefined;
      }
    },
    [asyncFn],
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return {
    state,
    execute,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError:   state.status === 'error',
    reset,
  };
}
