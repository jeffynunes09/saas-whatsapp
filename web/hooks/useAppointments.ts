'use client';

import { useState, useEffect, useCallback } from 'react';
import { appointmentService, Appointment, AppointmentStatus } from '@/services/appointmentService';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await appointmentService.list();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    await appointmentService.updateStatus(id, status);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  return { appointments, loading, updateStatus, reload: load };
}
