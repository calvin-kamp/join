import { Component, computed, input } from '@angular/core';
import { LinkComponent } from '../link/link.component';
import { InitialLetterComponent } from '../initial-letter/initial-letter.component';
import { Contact } from '@features/contacts/contacts.service';

@Component({
    selector: 'ui-contact',
    imports: [LinkComponent, InitialLetterComponent],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss'
})
export class ContactComponent {
    showEmail = input<boolean>(true);
    compact = input<boolean>(true);
    contact = input.required<Contact>();

    protected readonly mailHref = computed(() => {
        const mail = this.contact().mail.trim();

        return mail ? `mailto:${mail}` : null;
    });
}
