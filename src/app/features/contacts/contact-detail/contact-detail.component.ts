import { Component, effect, inject, input, signal } from '@angular/core';
import { Contact, ContactsService } from '../contacts.service';
import { LinkComponent } from '@shared/ui/link/link.component';

@Component({
    selector: 'contacts-contact-detail',
    imports: [LinkComponent],
    templateUrl: './contact-detail.component.html',
    styleUrl: './contact-detail.component.scss'
})
export class ContactDetailComponent {
    contactService = inject(ContactsService);
    contactID = input.required<number>();

    contact = signal<Contact | undefined>(undefined);

    constructor() {
        effect(async () => {
            this.contact.set(await this.contactService.getContactByID(this.contactID()));
        });
    }
}
