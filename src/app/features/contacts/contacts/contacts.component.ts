import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactListComponent } from '../components/contact-list/contact-list.component';
import { ContactFormComponent } from '../components/contact-form/contact-form.component';
import { ContactsService } from '../contacts.service';

/**
 * Contacts page: list on the left, selected contact (child route) on the right,
 * plus the add/edit dialog.
 */
@Component({
    selector: 'contacts',
    imports: [RouterOutlet, ContactListComponent, ContactFormComponent],
    templateUrl: './contacts.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
    protected contactsService = inject(ContactsService);

    /** Loads the contact list each time the page is opened. */
    ngOnInit(): void {
        void this.contactsService.getContacts();
    }
}
