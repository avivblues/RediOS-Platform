import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ExperienceNotification, RuntimeContext } from '@redios/shared';
import { Model } from 'mongoose';
import { NotificationStreamService } from './notification-stream.service';
import {
  EXPERIENCE_NOTIFICATION_MODEL,
  type ExperienceNotificationRecord,
} from './schemas/experience-notification.schema';

export interface RecordNotificationInput {
  tenantId: string;
  userId?: string;
  targetRole?: string;
  title: string;
  message: string;
  eventCode?: string;
}

@Injectable()
export class NotificationCenterService {
  constructor(
    @InjectModel(EXPERIENCE_NOTIFICATION_MODEL)
    private readonly model: Model<ExperienceNotificationRecord>,
    private readonly notificationStream: NotificationStreamService,
  ) {}

  async record(input: RecordNotificationInput): Promise<ExperienceNotification> {
    const saved = await this.model.create({
      tenantId: input.tenantId,
      userId: input.userId,
      targetRole: input.targetRole,
      title: input.title,
      message: input.message,
      eventCode: input.eventCode,
      read: false,
    });

    const notification = this.toNotification(saved.toObject());
    this.notificationStream.publish({
      tenantId: input.tenantId,
      userId: input.userId,
      targetRole: input.targetRole,
      notification,
    });

    return notification;
  }

  async list(context: RuntimeContext, limit = 20, since?: string): Promise<ExperienceNotification[]> {
    const roles = context.roles ?? [];
    const query: Record<string, unknown> = {
      tenantId: context.tenantId,
      $or: [
        { userId: context.userId },
        { targetRole: { $in: roles } },
        { targetRole: { $exists: false } },
        { targetRole: null },
      ],
    };

    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }

    const records = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return records.map((record) => this.toNotification(record));
  }

  async markRead(context: RuntimeContext, notificationId: string): Promise<ExperienceNotification | null> {
    const updated = await this.model
      .findOneAndUpdate(
        { _id: notificationId, tenantId: context.tenantId },
        { read: true },
        { new: true },
      )
      .lean()
      .exec();

    return updated ? this.toNotification(updated) : null;
  }

  private toNotification(record: ExperienceNotificationRecord & { _id?: unknown }): ExperienceNotification {
    return {
      id: String(record._id ?? record.id ?? ''),
      title: record.title,
      message: record.message,
      eventCode: record.eventCode,
      targetRole: record.targetRole,
      read: Boolean(record.read),
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}
