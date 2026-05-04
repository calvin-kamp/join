import { inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
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

    formOpenRequests$ = new Subject<Contact | undefined>();

    constructor() {
        this.getContacts();
    }

    requestFormOpen(contact?: Contact): void {
        this.formOpenRequests$.next(contact);
    }

    async getContacts(): Promise<void> {
        const contacts: Contact[] = await this.supabase.select('contacts');

        if (!contacts) {
            return;
        }

        this.contacts.set(contacts);
    }

    async getContactByID(id: number): Promise<Contact | undefined> {
        const contact: Contact = await this.supabase.selectByID('contacts', id);

        return contact ?? undefined;
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
