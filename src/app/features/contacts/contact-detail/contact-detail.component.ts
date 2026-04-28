import { Component, effect, inject, input, signal } from '@angular/core';
import { Contact, ContactsService } from '../contacts.service';
import { LinkComponent } from '@shared/ui/link/link.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';

@Component({
    selector: 'contacts-contact-detail',
    imports: [LinkComponent, InitialLetterComponent],
    templateUrl: './contact-detail.component.html',
    styleUrl: './contact-detail.component.scss'
})
export class ContactDetailComponent {
    private contactService = inject(ContactsService);
    readonly contactID = input.required<number>();

    contact = signal<Contact | undefined>(undefined);

    constructor() {
        effect(async () => {
            this.contact.set(await this.contactService.getContactByID(this.contactID()));
        });
    }
}
