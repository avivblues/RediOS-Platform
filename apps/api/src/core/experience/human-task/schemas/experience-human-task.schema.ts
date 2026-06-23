import { Schema } from 'mongoose';

export const EXPERIENCE_HUMAN_TASK_MODEL = 'ExperienceHumanTask';
export const EXPERIENCE_HUMAN_TASK_COLLECTION = 'experience_human_tasks';

export interface ExperienceHumanTaskRecord {
  id?: string;
  tenantId: string;
  title: string;
  entityCode?: string;
  documentId?: string;
  actionCode?: string;
  processCode?: string;
  stepCode?: string;
  assigneeUserId?: string;
  assigneeRoles: string[];
  status: 'WAITING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  source: 'PROCESS' | 'WORKFLOW' | 'MANUAL';
  dueAt?: Date;
  approvalMode?: 'SINGLE' | 'SEQUENTIAL' | 'PARALLEL';
  approvalLevel?: number;
  approvalGroupId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ExperienceHumanTaskSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    entityCode: { type: String, required: false, index: true },
    documentId: { type: String, required: false, index: true },
    actionCode: { type: String, required: false },
    processCode: { type: String, required: false },
    stepCode: { type: String, required: false },
    assigneeUserId: { type: String, required: false, index: true },
    assigneeRoles: { type: [String], required: true, default: [] },
    status: { type: String, required: true, default: 'WAITING', index: true },
    priority: { type: String, required: true, default: 'NORMAL' },
    source: { type: String, required: true, default: 'PROCESS' },
    dueAt: { type: Date, required: false },
    approvalMode: { type: String, required: false },
    approvalLevel: { type: Number, required: false },
    approvalGroupId: { type: String, required: false, index: true },
  },
  {
    collection: EXPERIENCE_HUMAN_TASK_COLLECTION,
    timestamps: true,
  },
);
