import { inject, Injectable, signal } from '@angular/core';
import { Database } from '@core/supabase/database.types';
import { SupabaseService } from '@core/supabase/supabase.service';
import { Contact } from '@features/contacts/contacts.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

export interface Task {
    id?: number; //auto generated
    title: string; //is required
    descprition: string; // can be empty string
    dueDate?: Date | null; // can be null Format yyyy-mm-dd
    priority: NamedEntity;
    category: NamedEntity;
    status: NamedEntity;
    createdBy?: string; // UUID
    assignTo: Contact[];
    subTasks: Subtask[];
}

export interface Subtask {
    id?: number;
    taskId: number;
    title: string;
    status: boolean;
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

    async getTasks(): Promise<void> {
        const tasks: Task[] = await this.supabase.selectByRef('tasks');

        if (!tasks) {
            return;
        }

        this.tasks.set(tasks);
    }

    async getTaskByID(id: number): Promise<Task | undefined> {
        const task: Task = await this.supabase.selectByRefId('tasks', id);

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

    async deleteContact(id: number): Promise<void> {
        await this.supabase.delete('tasks', id);
        await this.getTasks();
    }
}
