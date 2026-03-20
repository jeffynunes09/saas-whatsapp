import { api } from './api';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  subscriberId: string;
  conversationId: string | null;
  contactPhone: string;
  contactName?: string;
  collectedData: Record<string, string>;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export const appointmentService = {
  list: () => api.get<Appointment[]>('/appointments').then((r) => r.data),
  updateStatus: (id: string, status: AppointmentStatus) =>
    api.patch(`/appointments/${id}/status`, { status }).then((r) => r.data),
};
