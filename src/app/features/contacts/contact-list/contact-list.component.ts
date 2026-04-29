import { Component, inject } from '@angular/core';
import { ContactsService } from '../contacts.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ContactComponent } from '@shared/ui/contact/contact.component';

@Component({
    selector: 'contacts-contact-list',
    imports: [ButtonComponent, ContactComponent],
    templateUrl: './contact-list.component.html',
    styleUrl: './contact-list.component.scss'
})
export class ListComponent {
    contactsService = inject(ContactsService);

    ngOnInit() {
        this.contactsService.getContacts();
    }

    sortedContacts() {
        return this.contactsService.contacts().sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    showDetail(id: number) {}
}
