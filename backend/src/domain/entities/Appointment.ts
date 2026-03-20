export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  subscriberId: string;
  conversationId: string | null;
  contactPhone: string;
  contactName?: string;
  collectedData: Record<string, string>;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}
