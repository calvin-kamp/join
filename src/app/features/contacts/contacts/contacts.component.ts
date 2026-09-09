import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactListComponent } from '../components/contact-list/contact-list.component';
import { ContactFormComponent } from '../components/contact-form/contact-form.component';
import { ContactsService } from '../contacts.service';

@Component({
    selector: 'contacts',
    imports: [RouterOutlet, ContactListComponent, ContactFormComponent],
    templateUrl: './contacts.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
    protected contactsService = inject(ContactsService);
}
