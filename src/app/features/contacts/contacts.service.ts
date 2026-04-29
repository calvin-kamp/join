import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from '@core/supabase/supabase.service';

export interface Contact {
    id?: number;
    name: string;
    mail: string;
    phone: string;
}

@Injectable({ providedIn: 'root' })
export class ContactsService {
    supabase = inject(SupabaseService);
    contacts = signal<Contact[]>([]);

    async getContacts(): Promise<void> {
        const contacts: Contact[] = await this.supabase.select('contacts');

        if (!contacts) {
            return;
        }

        this.contacts.set(contacts);
    }

    async addContact(contact: Contact): Promise<void> {
        await this.supabase.insert<Contact>('contacts', contact);

        await this.getContacts();
    }

    async updateContact(contact: Contact & { id: number }): Promise<void> {
        const { id, ...data } = contact;
        await this.supabase.update('contacts', id, data);

        await this.getContacts();
    }

    async deleteContact(id: number): Promise<void> {
        await this.supabase.delete('contacts', id);

        await this.getContacts();
    }
}
