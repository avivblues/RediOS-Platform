import { Schema } from 'mongoose';

export const EXPERIENCE_NOTIFICATION_MODEL = 'ExperienceNotification';
export const EXPERIENCE_NOTIFICATION_COLLECTION = 'experience_notifications';

export interface ExperienceNotificationRecord {
  id?: string;
  tenantId: string;
  userId?: string;
  targetRole?: string;
  title: string;
  message: string;
  eventCode?: string;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ExperienceNotificationSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: false, index: true },
    targetRole: { type: String, required: false, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    eventCode: { type: String, required: false },
    read: { type: Boolean, required: true, default: false },
  },
  {
    collection: EXPERIENCE_NOTIFICATION_COLLECTION,
    timestamps: true,
  },
);
