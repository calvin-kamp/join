import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService, type Contact } from '@features/contacts/contacts.service';
import { controlErrorMessage } from '@shared/forms/control-error-message';
import { InputComponent } from '@shared/ui/forms/input/input.component';
import { DialogComponent } from '@shared/ui/dialog/dialog.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';
import { toSignal } from '@angular/core/rxjs-interop';

type FormType = 'add' | 'edit';

@Component({
    selector: 'contacts-contact-form',
    imports: [ReactiveFormsModule, InputComponent, DialogComponent, ButtonComponent, InitialLetterComponent],
    templateUrl: './contact-form.component.html',
    styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent {
    private fb = inject(FormBuilder);
    private contactsService = inject(ContactsService);

    private editingContact = signal<Contact | null>(null);

    readonly formType = computed<FormType>(() => (this.editingContact() ? 'edit' : 'add'));

    isOpen = signal<boolean>(false);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);

    contactForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.minLength(6)]]
    });

    nameValue = toSignal(this.contactForm.controls.name.valueChanges, {
        initialValue: this.contactForm.controls.name.value
    });

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

    open(contact?: Contact): void {
        if (contact) {
            this.editingContact.set(contact);
            this.contactForm.patchValue({
                name: contact.name,
                email: contact.mail,
                phone: contact.phone
            });
        } else {
            this.editingContact.set(null);
            this.contactForm.reset();
        }
        this.error.set(null);
        this.isOpen.set(true);
    }

    close(): void {
        this.isOpen.set(false);
        this.contactForm.reset();
        this.editingContact.set(null);
        this.error.set(null);
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

            if (editing?.id) {
                await this.contactsService.updateContact({ ...contactData, id: editing.id });
            } else {
                await this.contactsService.addContact(contactData);
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
        } catch {
            this.error.set('Failed to delete contact.');
        } finally {
            this.loading.set(false);
        }
    }
}
