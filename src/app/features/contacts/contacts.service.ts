import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from '@core/supabase/supabase.service';

interface Contact {
    id?: number;
    name: string;
    mail: string;
    phone: string;
}

@Injectable({
    providedIn: 'root'
})
export class ContactsService {
    supabase = inject(SupabaseService);
    contacts = signal<Contact[]>([]);

    async getContacts() {
        const contacts = await this.supabase.select<Contact[]>('contacts');

        if (!contacts) {
            return;
        }

        this.contacts.set(contacts);
    }

    async addContact(contact: Contact) {
        const contacts = await this.supabase.insert<Contact>('contacts', contact);
    }

    async updateContact(contact: Contact & { id: number }) {
        await this.supabase.update<Contact & { id: number }>('contacts', contact);
    }

    async deleteContact(id: number) {
        const contacts = await this.supabase.delete('contacts', id);
    }
}
