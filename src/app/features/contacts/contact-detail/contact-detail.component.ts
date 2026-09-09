import { Component, effect, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ContactsService, type Contact } from '@features/contacts/contacts.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';
import { LinkComponent } from '@shared/ui/link/link.component';

@Component({
    selector: 'contacts-contact-detail',
    imports: [ButtonComponent, IconComponent, InitialLetterComponent, LinkComponent],
    templateUrl: './contact-detail.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './contact-detail.component.scss'
})
export class ContactDetailComponent {
    private contactsService = inject(ContactsService);
    private authService = inject(AuthService);
    private router = inject(Router);

    readonly id = input.required<number, string>({
        transform: (value: string) => Number(value)
    });

    contact = signal<Contact | undefined>(undefined);

    menuOpen = signal<boolean>(false);
    detailVisible = signal<boolean>(false);

    constructor() {
        effect((onCleanup) => {
            const id = this.id();

            let cancelled = false;
            let firstFrame = 0;
            let secondFrame = 0;

            this.detailVisible.set(false);
            this.contact.set(undefined);

            void this.loadContact(id, (contact) => {
                if (cancelled) {
                    return;
                }

                this.contact.set(contact);

                firstFrame = requestAnimationFrame(() => {
                    secondFrame = requestAnimationFrame(() => {
                        if (!cancelled) {
                            this.detailVisible.set(Boolean(contact));
                        }
                    });
                });
            });

            onCleanup(() => {
                cancelled = true;
                cancelAnimationFrame(firstFrame);
                cancelAnimationFrame(secondFrame);
            });
        });
    }

    private async loadContact(id: number, callback: (contact: Contact | undefined) => void): Promise<void> {
        var contact;
        if (id === 0) {
            contact = this.authService.getUserContact();
            contact.id = 0;
        } else {
            contact = await this.contactsService.getContactByID(id);
        }

        callback(contact);
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
        this.router.navigate(['/contacts']);
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
