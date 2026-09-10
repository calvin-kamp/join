import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from '@core/supabase/supabase.service';
import { Contact } from '@features/contacts/contacts.service';

/** Row of a lookup table (priority, category, status). */
export interface NamedEntity {
    id: number;
    name: string;
}

/** A task as used in the UI, with all relations resolved. */
export interface Task {
    id: number;
    title: string;
    description: string;
    /** ISO date `yyyy-mm-dd`, `null` without due date. */
    dueDate: string | null;
    priority: NamedEntity;
    category: NamedEntity;
    status: NamedEntity;
    /** Id of the user who created the task. */
    createdBy: string | null;
    assignedTo: Contact[];
    subtasks: Subtask[];
}

/** Checklist item of a task. `status: true` means done. */
export interface Subtask {
    id: number;
    taskId: number;
    title: string;
    status: boolean;
}

/** Everything {@link TasksService.createTask} needs to create a task with its relations. */
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

/**
 * Everything {@link TasksService.editTask} needs to save a task.
 *
 * Contains no status (unchanged by the form) and no subtask state; subtask
 * states are kept by title.
 */
export interface EditTaskPayload {
    title: string;
    description: string;
    dueDate: string | null;
    priorityId: number;
    categoryId: number;
    assignedContactIds: number[];
    subtasks: Array<{
        title: string;
    }>;
}

/** Column values for a direct update of the `tasks` row (database column names). */
export interface UpdateTaskPayload {
    title?: string;
    description?: string;
    due_date?: string | null;
    priority?: number;
    category?: number;
    status?: number;
    created_by?: string | null;
}

/** Supabase returns joined relations as object or array depending on the relation type. */
type MaybeArray<T> = T | T[] | null;

/** Raw task row as returned by the select query in {@link TasksService.getTasks}. */
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

/**
 * Loads and changes tasks and keeps the current list in a signal.
 *
 * The list is not loaded on creation; pages that show tasks call
 * {@link getTasks} themselves. Every write method reloads the list afterwards.
 */
@Injectable({
    providedIn: 'root'
})
export class TasksService {
    private readonly supabase = inject(SupabaseService);

    /** All tasks from the last {@link getTasks} call. */
    readonly tasks = signal<Task[]>([]);

    /**
     * Reloads all tasks with their relations into {@link tasks}.
     *
     * @throws {PostgrestError} If the query fails.
     */
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

    /**
     * Reads one task with its relations.
     *
     * @throws {PostgrestError} If the query fails or no task matches.
     */
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

    /**
     * Creates a task, then its contact assignments and subtasks.
     *
     * The three inserts are separate requests; if a later one fails, the task
     * row already exists.
     *
     * @throws {PostgrestError} If one of the inserts fails.
     */
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

    /** Updates columns of the `tasks` row directly (e.g. the status after a drag). */
    async updateTask(payload: UpdateTaskPayload, id: number): Promise<void> {
        await this.supabase.update('tasks', id, payload as Record<string, unknown>);
        await this.getTasks();
    }

    /**
     * Saves a task from the edit form.
     *
     * Contact assignments and subtasks are deleted and inserted again. The
     * done state of a subtask survives if its title is unchanged.
     *
     * @throws {PostgrestError} If one of the requests fails.
     */
    async editTask(id: number, task: EditTaskPayload): Promise<void> {
        const { error: taskError } = await this.supabase.client
            .from('tasks')
            .update({
                title: task.title,
                description: task.description,
                due_date: task.dueDate,
                priority: task.priorityId,
                category: task.categoryId
            })
            .eq('id', id);

        if (taskError) {
            throw taskError;
        }

        const { error: deleteContactsError } = await this.supabase.client
            .from('task_contacts')
            .delete()
            .eq('task_id', id);

        if (deleteContactsError) {
            throw deleteContactsError;
        }

        if (task.assignedContactIds.length > 0) {
            const { error } = await this.supabase.client.from('task_contacts').insert(
                task.assignedContactIds.map((contactId) => ({
                    task_id: id,
                    contacts_id: contactId
                }))
            );

            if (error) {
                throw error;
            }
        }

        const { data: existingSubtasks, error: fetchSubtasksError } = await this.supabase.client
            .from('subtasks')
            .select('title, status')
            .eq('task_id', id);

        if (fetchSubtasksError) {
            throw fetchSubtasksError;
        }

        const statusByTitle = new Map((existingSubtasks ?? []).map((s) => [s.title, s.status]));

        const { error: deleteSubtasksError } = await this.supabase.client.from('subtasks').delete().eq('task_id', id);

        if (deleteSubtasksError) {
            throw deleteSubtasksError;
        }

        if (task.subtasks.length > 0) {
            const { error } = await this.supabase.client.from('subtasks').insert(
                task.subtasks.map((subtask) => ({
                    task_id: id,
                    title: subtask.title,
                    status: statusByTitle.get(subtask.title) ?? false
                }))
            );

            if (error) {
                throw error;
            }
        }

        await this.getTasks();
    }

    /**
     * Deletes a task.
     *
     * @throws {PostgrestError} If the delete fails.
     */
    async deleteTask(id: number): Promise<void> {
        const { error } = await this.supabase.client.from('tasks').delete().eq('id', id);

        if (error) {
            throw error;
        }

        await this.getTasks();
    }

    /** Adds a subtask to an existing task. */
    async createSubtask(subtask: Subtask): Promise<void> {
        await this.supabase.insert('subtasks', {
            task_id: subtask.taskId,
            title: subtask.title,
            status: subtask.status
        });
        await this.getTasks();
    }

    /** Updates columns of a subtask row, e.g. `{ status: true }`. */
    async updateSubtask(id: number, payload: {}): Promise<void> {
        await this.supabase.update('subtasks', id, payload);
        await this.getTasks();
    }

    /** Deletes a subtask. */
    async deleteSubtask(id: number): Promise<void> {
        this.supabase.delete('subtasks', id);
        await this.getTasks();
    }

    /** Converts a raw row into a {@link Task}. */
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

    /** Returns the single related row; `{ id: 0, name: '' }` if it is missing. */
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

    /** Extracts the contacts from the `task_contacts` join rows. */
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

    /** Converts raw subtask rows into {@link Subtask} objects. */
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
