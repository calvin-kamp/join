import {
    Component,
    effect,
    inject,
    input,
    signal,
    ChangeDetectionStrategy,
    type EffectCleanupRegisterFn
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ContactsService, type Contact } from '@features/contacts/contacts.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';
import { LinkComponent } from '@shared/ui/link/link.component';

/**
 * Detail view of one contact (route `/contacts/:id`).
 *
 * Id `0` shows the signed-in user. The view slides in after each load.
 */
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

    /** Contact id from the route; `0` is the signed-in user. */
    readonly id = input.required<number, string>({
        transform: (value: string) => Number(value)
    });

    /** The loaded contact, `undefined` while loading or if not found. */
    contact = signal<Contact | undefined>(undefined);

    /** `true` while the mobile action menu is open. */
    menuOpen = signal<boolean>(false);

    /** Drives the slide-in animation; set two frames after the contact is rendered. */
    detailVisible = signal<boolean>(false);

    /** Reloads the contact whenever the route id changes. */
    constructor() {
        effect((onCleanup) => this.showContact(this.id(), onCleanup));
    }

    /** Opens or closes the mobile action menu. */
    toggleMenu(): void {
        this.menuOpen.update((open) => !open);
    }

    /** Closes the mobile action menu. */
    closeMenu(): void {
        this.menuOpen.set(false);
    }

    /** Opens the contact form for the shown contact and returns to the list route. */
    onEdit(): void {
        const contact = this.contact();

        if (contact) {
            this.closeMenu();
            this.contactsService.requestFormOpen(contact);
        }
        this.router.navigate(['/contacts']);
    }

    /** Deletes the shown contact and returns to the list route. */
    async onDelete(): Promise<void> {
        const contact = this.contact();

        if (!contact?.id) {
            return;
        }

        this.closeMenu();
        await this.contactsService.deleteContact(contact.id);
        this.router.navigate(['/contacts']);
    }

    /**
     * Hides the view, loads the contact and slides the view back in.
     *
     * The slide-in starts two animation frames after the contact is set, so
     * the browser renders the hidden state first and the transition runs.
     * A newer id cancels a pending load via `onCleanup`.
     */
    private showContact(id: number, onCleanup: EffectCleanupRegisterFn): void {
        let cancelled = false;
        let firstFrame = 0;
        let secondFrame = 0;

        this.detailVisible.set(false);
        this.contact.set(undefined);

        void this.loadContact(id).then((contact) => {
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
    }

    /** Reads the contact for `id`; id `0` returns the signed-in user as contact. */
    private async loadContact(id: number): Promise<Contact | undefined> {
        if (id === 0) {
            return { ...this.authService.getUserContact(), id: 0 };
        }

        return this.contactsService.getContactByID(id);
    }
}
