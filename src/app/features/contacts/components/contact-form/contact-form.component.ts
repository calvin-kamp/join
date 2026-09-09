import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService, type Contact } from '@features/contacts/contacts.service';
import { controlErrorMessage } from '@shared/forms/control-error-message';
import { InputComponent } from '@shared/ui/forms/input/input.component';
import { DialogComponent } from '@shared/ui/dialog/dialog.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/services/toast.service';

type FormType = 'add' | 'edit';

@Component({
    selector: 'contacts-contact-form',
    imports: [
        ReactiveFormsModule,
        InputComponent,
        DialogComponent,
        ButtonComponent,
        InitialLetterComponent,
        LogoComponent,
        IconComponent,
        LinkComponent
    ],
    templateUrl: './contact-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent {
    private fb = inject(FormBuilder);
    private contactsService = inject(ContactsService);
    private authService = inject(AuthService);
    private router = inject(Router);

    private editingContact = signal<Contact | null>(null);

    readonly formType = computed<FormType>(() => (this.editingContact() ? 'edit' : 'add'));

    toast = inject(ToastService);
    isOpen = signal<boolean>(false);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);

    contactForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.minLength(6)]]
    });

    nameValue = signal<string | null>(null);

    hasName = computed(() => !!this.nameValue()?.trim());
    displayName = computed(() => this.nameValue() ?? '');

    protected nameError = controlErrorMessage(this.contactForm.controls.name, {
        required: 'Name is required',
        minlength: 'Must be atleast 4 characters'
    });

    protected emailError = controlErrorMessage(this.contactForm.controls.email, {
        required: 'Email is required',
        email: 'Please enter a valid email address'
    });

    protected phoneError = controlErrorMessage(this.contactForm.controls.phone, {
        required: 'Phone is required',
        minlength: 'Must be atleast 6 characters'
    });

    constructor() {
        this.contactsService.formOpenRequests$.pipe(takeUntilDestroyed()).subscribe((contact) => this.open(contact));
    }

    open(contact?: Contact): void {
        if (contact) {
            this.editingContact.set(contact);
            this.contactForm.patchValue({
                name: contact.name,
                email: contact.mail,
                phone: contact.phone
            });

            this.nameValue.set(contact.name);
        } else {
            this.editingContact.set(null);
            this.contactForm.reset();

            this.nameValue.set(null);
        }

        this.error.set(null);
        this.isOpen.set(true);
    }

    close(): void {
        this.isOpen.set(false);
        this.contactForm.reset();
        this.editingContact.set(null);
        this.error.set(null);
        this.nameValue.set(null);
    }

    onNameBlur(): void {
        this.nameValue.set(this.contactForm.controls.name.value);
    }

    async onSubmit(): Promise<void> {
        this.contactForm.markAllAsTouched();

        if (this.contactForm.invalid) {
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        try {
            const { name, email, phone } = this.contactForm.getRawValue();

            const contactData = {
                name: name!,
                mail: email!,
                phone: phone!
            };

            const editing = this.editingContact();

            if (editing?.id === 0) {
                await this.authService.updateUserContact(contactData);
            } else if (editing?.id != null) {
                await this.contactsService.updateContact({ ...contactData, id: editing.id });
            } else {
                await this.contactsService.addContact(contactData);
                this.toast.show('Contact succesfully created');
            }

            this.close();
        } catch {
            this.error.set('Failed to save contact. Please try again.');
        } finally {
            this.loading.set(false);
        }
    }

    async onDelete(): Promise<void> {
        const contact = this.editingContact();

        if (!contact?.id) {
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        try {
            await this.contactsService.deleteContact(contact.id);

            this.close();
            this.router.navigate(['/contacts']);
        } catch {
            this.error.set('Failed to delete contact.');
        } finally {
            this.loading.set(false);
        }
    }
}
