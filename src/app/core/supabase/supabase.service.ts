import { Injectable } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { type Database } from './database.types';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
    readonly client: SupabaseClient<Database>;

    constructor() {
        this.client = createClient<Database>(environment.supabaseUrl, environment.supabaseKey);
    }

    async select<T extends keyof Database['public']['Tables']>(table: T) {
        const { data, error } = await this.client.from(table).select('*');

        if (error) {
            throw error;
        }

        return data;
    }

    async selectByID<T extends keyof Database['public']['Tables']>(table: T, id: number) {
        const { data, error } = await this.client.from(table).select('*').eq('id' as never, id as never).limit(1).single();

        if (error) {
            throw error;
        }

        return data;
    }

    async insert<T extends keyof Database['public']['Tables']>(
        tableName: T,
        payload: Database['public']['Tables'][T]['Insert']
    ): Promise<void> {
        const { error } = await this.client.from(tableName).insert(payload as never);

        if (error) {
            throw error;
        }
    }

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

    async delete<T extends keyof Database['public']['Tables']>(tableName: T, id: number): Promise<void> {
        const { error } = await this.client.from(tableName).delete().eq('id' as never, id as never);

        if (error) {
            throw error;
        }
    }

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
