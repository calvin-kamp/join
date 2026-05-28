import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from '@core/supabase/supabase.service';
import { Contact } from '@features/contacts/contacts.service';

export interface NamedEntity {
    id: number;
    name: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: string | null;
    priority: NamedEntity;
    category: NamedEntity;
    status: NamedEntity;
    createdBy: string | null;
    assignedTo: Contact[];
    subtasks: Subtask[];
}

export interface Subtask {
    id: number;
    taskId: number;
    title: string;
    status: boolean;
}

export interface CreateTaskPayload {
    title: string;
    description: string;
    dueDate: string | null;
    priorityId: number;
    categoryId: number;
    statusId: number;
    assignedContactIds: number[];
    subtasks: Array<{
        title: string;
        status: boolean;
    }>;
}

export interface UpdateTaskPayload {
    title?: string;
    description?: string;
    due_date?: string | null;
    priority?: number;
    category?: number;
    status?: number;
    created_by?: string | null;
}

type MaybeArray<T> = T | T[] | null;

interface TaskRow {
    id: number;
    title: string | null;
    description: string | null;
    due_date: string | null;
    created_by: string | null;
    priority: MaybeArray<NamedEntity>;
    category: MaybeArray<NamedEntity>;
    status: MaybeArray<NamedEntity>;
    subtasks: Array<{
        id: number;
        task_id: number;
        title: string | null;
        status: boolean;
    }> | null;
    task_contacts: Array<{
        contacts: Contact | Contact[] | null;
    }> | null;
}

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    private readonly supabase = inject(SupabaseService);

    readonly tasks = signal<Task[]>([]);

    constructor() {
        this.getTasks();
    }

    async getTasks(): Promise<void> {
        const { data, error } = await this.supabase.client.from('tasks').select(`
                id,
                title,
                description,
                due_date,
                created_by,
                priority:priority (
                    id,
                    name
                ),
                category:category (
                    id,
                    name
                ),
                status:status (
                    id,
                    name
                ),
                subtasks (
                    id,
                    task_id,
                    title,
                    status
                ),
                task_contacts (
                    contacts:contacts_id (
                        id,
                        name,
                        mail,
                        phone
                    )
                )
            `);

        if (error) {
            throw error;
        }

        this.tasks.set((data ?? []).map((task) => this.mapTask(task as unknown as TaskRow)));
    }

    async getTaskByID(id: number): Promise<Task | undefined> {
        const { data, error } = await this.supabase.client
            .from('tasks')
            .select(
                `
                id,
                title,
                description,
                due_date,
                created_by,
                priority:priority (
                    id,
                    name
                ),
                category:category (
                    id,
                    name
                ),
                status:status (
                    id,
                    name
                ),
                subtasks (
                    id,
                    task_id,
                    title,
                    status
                ),
                task_contacts (
                    contacts:contacts_id (
                        id,
                        name,
                        mail,
                        phone
                    )
                )
            `
            )
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        return this.mapTask(data as unknown as TaskRow);
    }

    async createTask(task: CreateTaskPayload): Promise<void> {
        const { data: createdTask, error: taskError } = await this.supabase.client
            .from('tasks')
            .insert({
                title: task.title,
                description: task.description,
                due_date: task.dueDate,
                priority: task.priorityId,
                category: task.categoryId,
                status: task.statusId
            })
            .select('id')
            .single();

        if (taskError) {
            throw taskError;
        }

        const taskId = createdTask.id;

        if (task.assignedContactIds.length > 0) {
            const { error } = await this.supabase.client.from('task_contacts').insert(
                task.assignedContactIds.map((contactId) => ({
                    task_id: taskId,
                    contacts_id: contactId
                }))
            );

            if (error) {
                throw error;
            }
        }

        if (task.subtasks.length > 0) {
            const { error } = await this.supabase.client.from('subtasks').insert(
                task.subtasks.map((subtask) => ({
                    task_id: taskId,
                    title: subtask.title,
                    status: subtask.status
                }))
            );

            if (error) {
                throw error;
            }
        }

        await this.getTasks();
    }

    async updateTask(payload: UpdateTaskPayload, id: number): Promise<void> {
        await this.supabase.update('tasks', id, payload as Record<string, unknown>);
        await this.getTasks();
    }

    async deleteTask(id: number): Promise<void> {
        const { error } = await this.supabase.client.from('tasks').delete().eq('id', id);

        if (error) {
            throw error;
        }

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

    private mapTask(task: TaskRow): Task {
        return {
            id: task.id,
            title: task.title ?? '',
            description: task.description ?? '',
            dueDate: task.due_date,
            createdBy: task.created_by,
            priority: this.getSingleRelation(task.priority),
            category: this.getSingleRelation(task.category),
            status: this.getSingleRelation(task.status),
            assignedTo: this.mapAssignedContacts(task.task_contacts),
            subtasks: this.mapSubtasks(task.subtasks)
        };
    }

    private getSingleRelation(relation: MaybeArray<NamedEntity>): NamedEntity {
        if (Array.isArray(relation)) {
            return (
                relation[0] ?? {
                    id: 0,
                    name: ''
                }
            );
        }

        return (
            relation ?? {
                id: 0,
                name: ''
            }
        );
    }

    private mapAssignedContacts(taskContacts: TaskRow['task_contacts']): Contact[] {
        if (!taskContacts) {
            return [];
        }

        return taskContacts
            .map((item) => {
                if (Array.isArray(item.contacts)) {
                    return item.contacts[0] ?? null;
                }

                return item.contacts;
            })
            .filter((contact): contact is Contact => contact !== null);
    }

    private mapSubtasks(subtasks: TaskRow['subtasks']): Subtask[] {
        if (!subtasks) {
            return [];
        }

        return subtasks.map((subtask) => ({
            id: subtask.id,
            taskId: subtask.task_id,
            title: subtask.title ?? '',
            status: subtask.status
        }));
    }
}
