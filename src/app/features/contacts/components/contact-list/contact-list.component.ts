import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ContactsService, type Contact } from '@features/contacts/contacts.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ContactComponent } from '@shared/ui/contact/contact.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
    selector: 'contacts-contact-list',
    imports: [RouterLink, RouterLinkActive, ButtonComponent, ContactComponent, IconComponent],
    templateUrl: './contact-list.component.html',
    styleUrl: './contact-list.component.scss'
})
export class ContactListComponent {
    private contactsService = inject(ContactsService);
    private authService = inject(AuthService);

    contacts = input.required<Contact[]>();
    user = input(this.authService.displayName());
    userContact: Contact = this.authService.getUserContact();

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

    addContact(): void {
        this.contactsService.requestFormOpen();
    }
}
