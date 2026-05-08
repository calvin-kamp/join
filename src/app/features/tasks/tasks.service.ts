import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from '@core/supabase/supabase.service';
import { Contact } from '@features/contacts/contacts.service';

export interface Task {
    id?: number; //auto generated
    title: string; //is required
    description: string; // can be empty string
    dueDate?: Date | null; // can be null Format yyyy-mm-dd
    priority: NamedEntity | number;
    category: NamedEntity | number;
    status: NamedEntity | number;
    createdBy?: string; // UUID
    assignTo?: Contact[];
    subTasks?: Subtask[];
}

export interface Subtask {
    id?: number;
    task_id: number;
    title: string;
    status?: boolean;
}

export interface NamedEntity {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    supabase = inject(SupabaseService);
    tasks = signal<Task[]>([]);

    constructor() {
        this.getTasks();
    }

    async getTasks() {
        const tasks: Task[] = await this.supabase.selectTasks();

        if (!tasks) {
            return;
        }

        this.tasks.set(tasks);
    }

    async getTaskByID(id: number): Promise<Task | undefined> {
        const task: Task = await this.supabase.selectTaskById(id);

        return task ?? undefined;
    }

    async createTask(task: Task): Promise<void> {
        await this.supabase.insert<Task>('tasks', task);

        await this.getTasks();
    }

    async updateTask(task: Task & { id: number }): Promise<void> {
        const { id, ...data } = task;

        await this.supabase.update('tasks', id, data);
        await this.getTasks();
    }

    async deleteTask(id: number): Promise<void> {
        await this.supabase.delete('tasks', id);
        await this.getTasks();
    }

    async createSubtask(subtask: Subtask) {
        await this.supabase.insert('subtasks', subtask);
        await this.getTasks();
    }
    async updateSubtask(id: number, payload: {}) {
        await this.supabase.update('subtasks', id, payload);
        await this.getTasks();
    }

    async deleteSubtask(id: number) {
        this.supabase.delete('subtasks', id);
        await this.getTasks();
    }
}
