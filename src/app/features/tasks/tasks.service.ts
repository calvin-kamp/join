import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from '@core/supabase/supabase.service';
import { Contact } from '@features/contacts/contacts.service';

export interface Task {
    id: number;
    title: string;
    description: string;
    due_date: Date | null;
    priority: NamedEntity;
    category: NamedEntity;
    status: NamedEntity;
    created_by: string | null;
    contacts: Contact[];
    subtasks: Subtask[];
}

export interface Subtask {
    id: number;
    task_id: number;
    title: string | null;
    status: boolean;
}

export interface NamedEntity {
    id: number;
    name: string;
}

export interface CreateTaskPayload {
    title: string;
    description?: string;
    due_date?: Date | null;
    priority?: number;
    category: number;
    status: number;
    created_by?: string | null;
}

export interface UpdateTaskPayload {
    title?: string;
    description?: string;
    due_date?: Date | null;
    priority?: number;
    category?: number;
    status?: number;
    created_by?: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    private supabase = inject(SupabaseService);

    tasks = signal<Task[]>([]);

    constructor() {
        this.getTasks();
    }

    async getTasks(): Promise<void> {
        const tasks = await this.supabase.selectTasks();

        if (!tasks) {
            return;
        }

        this.tasks.set(tasks);
    }

    async getTaskByID(id: number): Promise<Task | undefined> {
        const task = await this.supabase.selectTaskById(id);

        return task ?? undefined;
    }

    async createTask(task: CreateTaskPayload): Promise<void> {
        await this.supabase.insert<CreateTaskPayload>('tasks', task);
        await this.getTasks();
    }

    async updateTask(task: UpdateTaskPayload & { id: number }): Promise<void> {
        const { id, ...data } = task;

        await this.supabase.update('tasks', id, data);
        await this.getTasks();
    }

    async deleteTask(id: number): Promise<void> {
        await this.supabase.delete('tasks', id);
        await this.getTasks();
    }

    async createSubtask(subtask: Subtask): Promise<void> {
        await this.supabase.insert('subtasks', subtask);
        await this.getTasks();
    }
    async updateSubtask(id: number, payload: {}): Promise<void> {
        await this.supabase.update('subtasks', id, payload);
        await this.getTasks();
    }

    async deleteSubtask(id: number): Promise<void> {
        this.supabase.delete('subtasks', id);
        await this.getTasks();
    }
}
