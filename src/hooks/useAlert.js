import { useState, useCallback } from 'react';

let id = 0;

export function useAlert() {
  const [alerts, setAlerts] = useState([]);

  const push = useCallback((type, message, duration = 4000) => {
    const alertId = ++id;
    setAlerts((prev) => [...prev, { id: alertId, type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }, duration);
  }, []);

  const dismiss = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  return {
    alerts,
    dismiss,
    success: (msg, dur) => push('success', msg, dur),
    error:   (msg, dur) => push('error',   msg, dur),
    warning: (msg, dur) => push('warning', msg, dur),
    info:    (msg, dur) => push('info',    msg, dur),
  };
}
