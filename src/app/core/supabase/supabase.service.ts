import { Injectable } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { type Database } from './database.types';

/**
 * Owns the single Supabase client and offers generic table helpers.
 *
 * Every helper throws the Supabase error instead of returning it, so callers
 * can use `try`/`catch`.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
    /** Typed Supabase client for direct queries that the helpers don't cover. */
    readonly client: SupabaseClient<Database> = createClient<Database>(
        environment.supabaseUrl,
        environment.supabaseKey
    );

    /**
     * Reads all rows of a table.
     *
     * @throws {PostgrestError} If the query fails.
     */
    async select<T extends keyof Database['public']['Tables']>(table: T) {
        const { data, error } = await this.client.from(table).select('*');

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Reads the row with the given `id`.
     *
     * @throws {PostgrestError} If the query fails or no row matches.
     */
    async selectByID<T extends keyof Database['public']['Tables']>(table: T, id: number) {
        const { data, error } = await this.client.from(table).select('*').eq('id' as never, id as never).limit(1).single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Inserts one row.
     *
     * @throws {PostgrestError} If the insert fails.
     */
    async insert<T extends keyof Database['public']['Tables']>(
        tableName: T,
        payload: Database['public']['Tables'][T]['Insert']
    ): Promise<void> {
        const { error } = await this.client.from(tableName).insert(payload as never);

        if (error) {
            throw error;
        }
    }

    /**
     * Updates the row with the given `id`.
     *
     * @throws {PostgrestError} If the update fails.
     */
    async update<T extends keyof Database['public']['Tables']>(
        tableName: T,
        id: number,
        payload: Database['public']['Tables'][T]['Update']
    ): Promise<void> {
        const { error } = await this.client.from(tableName).update(payload as never).eq('id' as never, id as never);

        if (error) {
            throw error;
        }
    }

    /**
     * Deletes the row with the given `id`.
     *
     * @throws {PostgrestError} If the delete fails.
     */
    async delete<T extends keyof Database['public']['Tables']>(tableName: T, id: number): Promise<void> {
        const { error } = await this.client.from(tableName).delete().eq('id' as never, id as never);

        if (error) {
            throw error;
        }
    }

    /**
     * Reads all tasks including subtasks, contacts, priority, status and category.
     *
     * @throws {PostgrestError} If the query fails.
     */
    async selectTasks() {
        const { data, error } = await this.client.from('tasks').select(`
                *,
                subtasks (*),
                contacts (*),
                priority (*),
                status (*),
                category (*)
            `);

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Reads one task including its relations.
     *
     * @throws {PostgrestError} If the query fails or no task matches.
     */
    async selectTaskById(id: number) {
        const { data, error } = await this.client
            .from('tasks')
            .select(
                `
                *,
                subtasks (*),
                contacts (*),
                priority (*),
                status (*),
                category (*)
            `
            )
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }
}
