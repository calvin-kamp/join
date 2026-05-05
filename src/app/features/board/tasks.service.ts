import { inject, Injectable, signal } from '@angular/core';
import { Database } from '@core/supabase/database.types';
import { SupabaseService } from '@core/supabase/supabase.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

export interface Task {
    id?: number; //auto generated
    title: string; //is required
    descprition: string; // can be empty string
    dueDate: Date | null; // can be null
    priority: string | number;
    category: string | number;
    status: string | number;
    createdBy: string; // UUID
    assignTo: number[] | null;
    subTasks: number[];
}

export interface Subtask {
    id?: number;
    taskId: number;
    title: string;
    status: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    supabase = inject(SupabaseService);
    tasks = signal<any[]>([]);
    client: SupabaseClient;

    constructor() {
        //this.getTasks();
        this.client = createClient<Database>(environment.supabaseUrl, environment.supabaseKey);
        this.test();
    }

    // async getTasks(): Promise<void> {
    //     const tasks: any[] = await this.supabase.select('tasks');

    //     if (!tasks) {
    //         //console.log('no data');

    //         return;
    //     }
    //     //console.log('data:', tasks);

    //     this.tasks.set(tasks);
    // }

    async test() {
        const { data, error } = await this.client.from('tasks').select(`
            *,
            subtasks (*),
            contacts (*),
            priority (*),
            status (*),
            category (*)
        `);

        if (error) {
            console.error(error);
            return;
        }

        console.log(data);
        this.tasks.set(data);
    }
}
