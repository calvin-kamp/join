import { Injectable } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { type Database } from './database.types';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
    readonly client: SupabaseClient;

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
        const { data, error } = await this.client.from(table).select('*').eq('id', id).limit(1).single();

        if (error) {
            throw error;
        }

        return data;
    }

    async insert<T>(tableName: string, payload: T): Promise<void> {
        const { error } = await this.client.from(tableName).insert([payload]).select();

        if (error) {
            throw error;
        }
    }

    async update(tableName: string, id: number, payload: Record<string, unknown>): Promise<void> {
        const { error } = await this.client.from(tableName).update(payload).eq('id', id);

        if (error) {
            throw error;
        }
    }

    async delete(tableName: string, id: number): Promise<void> {
        const { error } = await this.client.from(tableName).delete().eq('id', id);

        if (error) {
            throw error;
        }
    }
}
