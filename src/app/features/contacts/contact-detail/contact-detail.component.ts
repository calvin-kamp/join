import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ContactsService, type Contact } from '@features/contacts/contacts.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';
import { LinkComponent } from '@shared/ui/link/link.component';

@Component({
    selector: 'contacts-contact-detail',
    imports: [ButtonComponent, IconComponent, InitialLetterComponent, LinkComponent],
    templateUrl: './contact-detail.component.html',
    styleUrl: './contact-detail.component.scss'
})
export class ContactDetailComponent {
    private contactsService = inject(ContactsService);
    private router = inject(Router);

    readonly id = input.required<number, string>({
        transform: (value: string) => Number(value)
    });

    contact = signal<Contact | undefined>(undefined);
    menuOpen = signal<boolean>(false);

    constructor() {
        effect(async () => {
            this.contact.set(await this.contactsService.getContactByID(this.id()));
        });
    }

    toggleMenu(): void {
        this.menuOpen.update((open) => !open);
    }

    closeMenu(): void {
        this.menuOpen.set(false);
    }

    onEdit(): void {
        const contact = this.contact();

        if (contact) {
            this.closeMenu();
            this.contactsService.requestFormOpen(contact);
        }
    }

    async onDelete(): Promise<void> {
        const contact = this.contact();

        if (!contact?.id) {
            return;
        }

        this.closeMenu();
        await this.contactsService.deleteContact(contact.id);
        this.router.navigate(['/contacts']);
    }
}
