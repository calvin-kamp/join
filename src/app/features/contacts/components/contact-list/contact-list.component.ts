import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ContactsService, type Contact } from '@features/contacts/contacts.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ContactComponent } from '@shared/ui/contact/contact.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

/**
 * Alphabetically grouped contact list with the signed-in user on top.
 */
@Component({
    selector: 'contacts-contact-list',
    imports: [RouterLink, RouterLinkActive, ButtonComponent, ContactComponent, IconComponent],
    templateUrl: './contact-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './contact-list.component.scss'
})
export class ContactListComponent {
    private contactsService = inject(ContactsService);
    private authService = inject(AuthService);

    /** Contacts to show. */
    contacts = input.required<Contact[]>();

    /** The signed-in user as contact with id `0`, shown in the "Me" group. */
    userContact = computed(() => {
        const id = 0;
        const user = this.authService.getUserContact();
        const userData: Contact = user;
        userData.id = id;

        return userData;
    });

    /** Contacts sorted by name and grouped by their first letter. */
    protected groupedContacts = computed(() => {
        const sorted = [...this.contacts()].sort((a, b) => a.name.localeCompare(b.name));
        const groups: { letter: string; contacts: Contact[] }[] = [];

        for (const contact of sorted) {
            const letter = contact.name.trim().charAt(0).toUpperCase();
            const last = groups.at(-1);

            if (last?.letter === letter) {
                last.contacts.push(contact);
            } else {
                groups.push({ letter, contacts: [contact] });
            }
        }

        return groups;
    });

    /** Opens the contact form for a new contact. */
    addContact(): void {
        this.contactsService.requestFormOpen();
    }
}
