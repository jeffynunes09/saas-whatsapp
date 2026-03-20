import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment';

export interface IAppointmentRepository {
  save(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
  findBySubscriberId(subscriberId: string): Promise<Appointment[]>;
  updateStatus(id: string, status: AppointmentStatus): Promise<void>;
}
