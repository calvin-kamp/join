import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { LinkComponent } from '../link/link.component';
import { InitialLetterComponent } from '../initial-letter/initial-letter.component';
import { Contact } from '@features/contacts/contacts.service';

/** Avatar with name and, optionally, email of a contact. */
@Component({
    selector: 'ui-contact',
    imports: [LinkComponent, InitialLetterComponent],
    templateUrl: './contact.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './contact.component.scss'
})
export class ContactComponent {
    /** Shows the email below the name. */
    showEmail = input<boolean>(true);

    /** Uses the smaller list layout. */
    compact = input<boolean>(true);

    /** Contact to show. */
    contact = input.required<Contact>();

    /** `mailto:` link, `null` if the contact has no email. */
    protected readonly mailHref = computed(() => {
        const mail = this.contact().mail.trim();

        return mail ? `mailto:${mail}` : null;
    });
}
