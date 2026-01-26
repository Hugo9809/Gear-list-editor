// @ts-check
import { useCallback, useState } from 'react';

/**
 * Generic hook for managing undo/redo history.
 * @template T
 * @param {T} initialState - The initial state value.
 * @returns {{
 *   state: T,
 *   setState: (newState: T | ((prev: T) => T)) => void,
 *   undo: () => void,
 *   redo: () => void,
 *   canUndo: boolean,
 *   canRedo: boolean,
 *   history: { past: T[], present: T, future: T[] }
 * }}
 */
export const useUndo = (initialState) => {
    const [history, setHistory] = useState({
        past: [],
        present: initialState,
        future: []
    });

    const { past, present, future } = history;

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    const undo = useCallback(() => {
        if (!canUndo) return;

        setHistory((curr) => {
            const previous = curr.past[curr.past.length - 1];
            const newPast = curr.past.slice(0, curr.past.length - 1);
            return {
                past: newPast,
                present: previous,
                future: [curr.present, ...curr.future]
            };
        });
    }, [canUndo]);

    const redo = useCallback(() => {
        if (!canRedo) return;

        setHistory((curr) => {
            const next = curr.future[0];
            const newFuture = curr.future.slice(1);
            return {
                past: [...curr.past, curr.present],
                present: next,
                future: newFuture
            };
        });
    }, [canRedo]);

    const setState = useCallback((newStateOrUpdater) => {
        setHistory((curr) => {
            const newState = typeof newStateOrUpdater === 'function'
                ? newStateOrUpdater(curr.present)
                : newStateOrUpdater;

            if (newState === curr.present) {
                return curr;
            }

            return {
                past: [...curr.past, curr.present],
                present: newState,
                future: []
            };
        });
    }, []);

    return {
        state: present,
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
        history
    };
};
