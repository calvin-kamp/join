import { inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { SupabaseService } from '@core/supabase/supabase.service';

/** A contact as used in the UI. `id` is missing before the contact is saved. */
export interface Contact {
    id?: number;
    name: string;
    mail: string;
    phone: string;
}

/**
 * Loads and changes contacts and keeps the current list in a signal.
 *
 * The list is not loaded on creation; pages that show contacts call
 * {@link getContacts} themselves.
 */
@Injectable({ providedIn: 'root' })
export class ContactsService {
    supabase = inject(SupabaseService);

    /** All contacts from the last {@link getContacts} call. */
    contacts = signal<Contact[]>([]);

    /**
     * Emits when some component wants the contact form opened.
     *
     * Carries the contact to edit, or `undefined` for a new contact.
     */
    formOpenRequests$ = new Subject<Contact | undefined>();

    /**
     * Asks the contact form to open.
     *
     * @param contact - Contact to edit; omit to create a new one.
     */
    requestFormOpen(contact?: Contact): void {
        this.formOpenRequests$.next(contact);
    }

    /**
     * Reloads all contacts into {@link contacts}.
     *
     * @throws {PostgrestError} If the query fails.
     */
    async getContacts(): Promise<void> {
        const rows = await this.supabase.select('contacts');
        const contacts: Contact[] = (rows ?? []).map((row) => ({
            id: row.id,
            name: row.name ?? '',
            mail: row.mail ?? '',
            phone: row.phone ?? ''
        }));

        if (!contacts) {
            return;
        }

        this.contacts.set(contacts);
    }

    /**
     * Reads a single contact.
     *
     * @throws {PostgrestError} If the query fails or no contact matches.
     */
    async getContactByID(id: number): Promise<Contact | undefined> {
        const row = await this.supabase.selectByID('contacts', id);
        const contact: Contact | null = row
            ? { id: row.id, name: row.name ?? '', mail: row.mail ?? '', phone: row.phone ?? '' }
            : null;

        return contact ?? undefined;
    }

    /** Saves a new contact and reloads the list. */
    async addContact(contact: Contact): Promise<void> {
        await this.supabase.insert('contacts', contact);
        await this.getContacts();
    }

    /** Saves changes to an existing contact and reloads the list. */
    async updateContact(contact: Contact & { id: number }): Promise<void> {
        const { id, ...data } = contact;

        await this.supabase.update('contacts', id, data);
        await this.getContacts();
    }

    /** Deletes a contact and reloads the list. */
    async deleteContact(id: number): Promise<void> {
        await this.supabase.delete('contacts', id);
        await this.getContacts();
    }
}
