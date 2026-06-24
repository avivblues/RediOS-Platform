import { Body, Controller, Get, Headers, Param, Patch, Put, Query, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ExperiencePlatform, ResolvedExperience, WorkspaceDefinition } from '@redios/shared';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { ExperienceEngine } from '../core/experience/experience-engine.service';
import { ExperienceRuntimeService } from '../core/experience/experience-runtime.service';
import { NotificationStreamService } from '../core/experience/notification/notification-stream.service';

@ApiTags('Experience')
@Controller('experience')
export class ExperienceController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly experienceEngine: ExperienceEngine,
    private readonly experienceRuntime: ExperienceRuntimeService,
    private readonly notificationStreamService: NotificationStreamService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Resolve persona, workspace, inbox, actions, and notifications.' })
  me(@Headers() headers: RuntimeHeaders, @Query('platform') platform?: ExperiencePlatform) {
    return this.experienceRuntime.resolveContext(this.contextEngine.resolve(headers), platform ?? 'WEB');
  }

  @Get('persona')
  @ApiOperation({ summary: 'Resolve platform persona from JWT context roles.' })
  persona(@Headers() headers: RuntimeHeaders) {
    return this.experienceRuntime.resolvePersona(this.contextEngine.resolve(headers));
  }

  @Get('workspace')
  @ApiOperation({ summary: 'Resolve metadata-driven workspace layout for the current persona.' })
  async workspace(@Headers() headers: RuntimeHeaders, @Query('platform') platform?: ExperiencePlatform) {
    const context = this.contextEngine.resolve(headers);
    const full = await this.experienceRuntime.resolveContext(context, platform ?? 'WEB');
    return full.workspace;
  }

  @Get('inbox')
  @ApiOperation({ summary: 'List universal inbox items for the current user.' })
  async inbox(@Headers() headers: RuntimeHeaders) {
    const context = this.contextEngine.resolve(headers);
    const full = await this.experienceRuntime.resolveContext(context);
    return { items: full.inbox };
  }

  @Get('actions')
  @ApiOperation({ summary: 'List dynamic action queue for the current persona.' })
  async actions(@Headers() headers: RuntimeHeaders) {
    const context = this.contextEngine.resolve(headers);
    const full = await this.experienceRuntime.resolveContext(context);
    return { items: full.actions };
  }

  @Get('notifications')
  @ApiOperation({ summary: 'List notification center items for the current user.' })
  notifications(@Headers() headers: RuntimeHeaders, @Query('since') since?: string) {
    return this.experienceRuntime.listNotifications(this.contextEngine.resolve(headers), since);
  }

  @Sse('notifications/stream')
  @ApiOperation({ summary: 'Stream notification center updates (SSE).' })
  streamNotifications(@Headers() headers: RuntimeHeaders, @Query('token') token?: string) {
    const context = this.contextEngine.resolveOptionalToken(token, headers);
    return this.notificationStreamService.stream(context);
  }

  @Get('workspaces')
  @ApiOperation({ summary: 'List workspace metadata definitions.' })
  workspaces(@Headers() headers: RuntimeHeaders) {
    return this.experienceRuntime.listWorkspaces(this.contextEngine.resolve(headers));
  }

  @Put('workspaces/:code')
  @ApiOperation({ summary: 'Save workspace metadata definition (panels, layout).' })
  saveWorkspace(
    @Headers() headers: RuntimeHeaders,
    @Param('code') code: string,
    @Body() definition: WorkspaceDefinition,
  ) {
    return this.experienceRuntime.saveWorkspace(this.contextEngine.resolve(headers), {
      ...definition,
      code,
    });
  }

  @Patch('inbox/:id/complete')
  @ApiOperation({ summary: 'Complete a human task inbox item (TunasFlow bridge).' })
  async completeInboxItem(@Headers() headers: RuntimeHeaders, @Param('id') id: string) {
    const completed = await this.experienceRuntime.completeInboxItem(this.contextEngine.resolve(headers), id);
    return { completed };
  }

  @Patch('inbox/:id/delegate')
  @ApiOperation({ summary: 'Delegate a human task to another user or role.' })
  async delegateInboxItem(
    @Headers() headers: RuntimeHeaders,
    @Param('id') id: string,
    @Body() body: { assigneeUserId?: string; assigneeRoles?: string[] },
  ) {
    const delegated = await this.experienceRuntime.delegateInboxItem(this.contextEngine.resolve(headers), id, body);
    return { delegated };
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark a notification as read.' })
  markNotificationRead(@Headers() headers: RuntimeHeaders, @Param('id') id: string) {
    return this.experienceRuntime.markNotificationRead(this.contextEngine.resolve(headers), id);
  }

  @Get(':entityCode')
  @ApiOperation({ summary: 'Resolve entity experience metadata for a platform.' })
  resolve(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Query('platform') platform?: ExperiencePlatform,
    @Query('device') device?: string,
  ): Promise<ResolvedExperience> {
    return this.experienceEngine.resolveExperience(this.contextEngine.resolve(headers), entityCode, {
      platform,
      device,
    });
  }
}
