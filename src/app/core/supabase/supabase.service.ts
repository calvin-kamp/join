import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
    readonly client: SupabaseClient;

    constructor() {
        this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
    }

    async select<T>(tableName: string, columns: string = '*'): Promise<T | undefined> {
        const { data, error } = await this.client.from(tableName).select(columns);

        if (error) {
            throw error;
        }
        console.log(data);

        return data as T;
    }

    async insert<T>(tableName: string, payload: T) {
        const { data, error } = await this.client.from(tableName).insert([payload]).select();

        if (error) {
            throw error;
        }
    }

    async update<T extends { id: number }>(tableName: string, payload: T) {
        const { id, ...data } = payload;
        const { error } = await this.client
            .from(tableName)
            .update(data as T)
            .eq('id', id)
            .select();

        if (error) {
            throw error;
        }
    }

    async delete(tableName: string, id: number) {
        const { data, error } = await this.client.from(tableName).delete().eq('id', id);

        if (error) {
            throw error;
        }
    }
}
