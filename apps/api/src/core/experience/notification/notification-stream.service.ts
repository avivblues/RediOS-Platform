import { Injectable, MessageEvent } from '@nestjs/common';
import type { ExperienceNotification, RuntimeContext } from '@redios/shared';
import { Observable, Subject, filter, interval, map, merge } from 'rxjs';

interface NotificationStreamEvent {
  tenantId: string;
  userId?: string;
  targetRole?: string;
  notification: ExperienceNotification;
}

@Injectable()
export class NotificationStreamService {
  private readonly bus = new Subject<NotificationStreamEvent>();

  publish(event: NotificationStreamEvent): void {
    this.bus.next(event);
  }

  stream(context: RuntimeContext): Observable<MessageEvent> {
    const roles = context.roles ?? [];

    const notifications$ = this.bus.pipe(
      filter((event) => event.tenantId === context.tenantId),
      filter((event) => {
        if (event.userId) {
          return event.userId === context.userId;
        }

        if (event.targetRole) {
          return roles.includes(event.targetRole);
        }

        return true;
      }),
      map((event) => ({
        data: {
          type: 'notification',
          notification: event.notification,
        },
      }) satisfies MessageEvent),
    );

    const heartbeat$ = interval(30_000).pipe(
      map(() => ({
        data: {
          type: 'heartbeat',
          at: new Date().toISOString(),
        },
      }) satisfies MessageEvent),
    );

    return merge(notifications$, heartbeat$);
  }
}
