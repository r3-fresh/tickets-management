import { useRef, useCallback, useEffect } from "react";

/**
 * Hook que devuelve una versión debounced de un callback.
 * Útil para búsquedas que actualizan URL search params.
 *
 * @param callback - Función a ejecutar después del delay
 * @param delay - Tiempo de espera en milisegundos
 * @returns Función debounced
 */
export function useDebounce<T extends (...args: Parameters<T>) => void>(
    callback: T,
    delay: number,
): T {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);

    // Mantener la referencia al callback actualizada
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback(
        ((...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        }) as T,
        [delay],
    );
}
