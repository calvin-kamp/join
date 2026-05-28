import { Component, computed, inject, input, output, signal } from '@angular/core';
import { InputComponent } from '@shared/ui/forms/input/input.component';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { RadioComponent } from '@shared/ui/forms/radio/radio.component';
import { DateComponent } from '@shared/ui/forms/date/date.component';
import { TextareaComponent } from '@shared/ui/forms/textarea/textarea.component';
import { IconComponent, type IconName } from '@shared/ui/icon/icon.component';
import { controlErrorMessage } from '@shared/forms/control-error-message';
import { SelectComponent, SelectOption } from '@shared/ui/forms/select/select.component';
import { ContactsService } from '@features/contacts/contacts.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { TasksService } from '@features/tasks/tasks.service';
import { STATUS_IDS } from '@features/tasks/tasks.constants';

export interface Priority {
    label: string;
    iconName: IconName;
    fillColor: string;
}

@Component({
    selector: 'tasks-task-form',
    imports: [
        InputComponent,
        FormsModule,
        DateComponent,
        TextareaComponent,
        IconComponent,
        ReactiveFormsModule,
        RadioComponent,
        SelectComponent,
        InitialLetterComponent,
        ButtonComponent
    ],
    templateUrl: './task-form.component.html',
    styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
    private fb = inject(FormBuilder);
    private tasksService = inject(TasksService);
    contactsService = inject(ContactsService);

    contacts = this.contactsService.contacts;

    // ── Inputs / Outputs ──────────────────────────────────────────────────────
    // When this form is rendered inside a dialog, the parent sets `showClose`
    // to `true`; the close button then emits `close` on click.
    showClose = input<boolean>(false);
    // Status id assigned to newly created tasks. Defaults to "To do" but the
    // board page passes the id of whichever column the user clicked "+" on.
    statusId = input<number>(STATUS_IDS.TODO);
    close = output<void>();
    created = output<void>();

    error = signal<string | null>(null);
    loading = signal<boolean>(false);

    // Numeric ids so the form value matches `CreateTaskPayload`.
    categories: SelectOption[] = [
        { name: 'Technical Task', id: 1 },
        { name: 'User Story', id: 2 }
    ];

    priorities: Priority[] = [
        { label: 'Urgent', iconName: 'badge-urgent', fillColor: 'var(--color-priority-urgent)' },
        { label: 'Medium', iconName: 'badge-medium', fillColor: 'var(--color-priority-medium)' },
        { label: 'Low', iconName: 'badge-low', fillColor: 'var(--color-priority-low)' }
    ];

    private readonly priorityIdByLabel: Record<string, number> = {
        Urgent: 1,
        Medium: 2,
        Low: 3
    };

    taskForm = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(6)]],
        description: [''],
        dueDate: ['', Validators.required],
        assignedTo: this.fb.control<number[]>([], { nonNullable: true }),
        priority: ['Medium', Validators.required],
        category: this.fb.control<number | null>(null, Validators.required)
    });

    titleError = controlErrorMessage(this.taskForm.controls.title, {
        required: 'Title is required',
        minlength: 'Must be atleast 6 characters'
    });

    dueDateError = controlErrorMessage(this.taskForm.controls.dueDate, {
        required: 'Due Date is required'
    });

    categoryError = controlErrorMessage(this.taskForm.controls.category, {
        required: 'Category is required'
    });

    // Tracks form validity reactively so the Create button can be disabled.
    private formStatus = toSignal(this.taskForm.statusChanges, { initialValue: this.taskForm.status });
    isInvalid = computed(() => this.formStatus() !== 'VALID');

    assignedContactIds = toSignal(this.taskForm.controls.assignedTo.valueChanges, {
        initialValue: this.taskForm.controls.assignedTo.value
    });

    assignedContacts = computed(() => {
        const selectedIds = this.assignedContactIds();
        return this.contacts().filter((contact) => {
            if (contact.id === undefined) return false;
            return selectedIds.includes(contact.id);
        });
    });

    // ── Subtasks ──────────────────────────────────────────────────────────────
    subtasks = signal<string[]>([]);
    editingSubtaskIndex = signal<number | null>(null);
    editingSubtaskValue = signal<string>('');

    addSubtask(title: string): void {
        this.subtasks.update((list) => [...list, title]);
    }

    removeSubtask(index: number): void {
        this.subtasks.update((list) => list.filter((_, i) => i !== index));
    }

    startEditSubtask(index: number): void {
        this.editingSubtaskIndex.set(index);
        this.editingSubtaskValue.set(this.subtasks()[index]);
    }

    confirmEditSubtask(): void {
        const idx = this.editingSubtaskIndex();
        const val = this.editingSubtaskValue().trim();
        if (idx === null || !val) return;
        this.subtasks.update((list) => list.map((item, i) => (i === idx ? val : item)));
        this.editingSubtaskIndex.set(null);
    }

    cancelEditSubtask(): void {
        this.editingSubtaskIndex.set(null);
    }

    // ── Form actions ──────────────────────────────────────────────────────────

    clearForm(): void {
        this.taskForm.reset({
            title: '',
            description: '',
            dueDate: '',
            assignedTo: [],
            priority: 'Medium',
            category: null
        });
        this.subtasks.set([]);
        this.editingSubtaskIndex.set(null);
        this.editingSubtaskValue.set('');
        this.error.set(null);
    }

    onCloseClick(): void {
        this.close.emit();
    }

    async onSubmit(): Promise<void> {
        this.taskForm.markAllAsTouched();
        if (this.taskForm.invalid) return;

        this.loading.set(true);
        this.error.set(null);

        const value = this.taskForm.getRawValue();

        try {
            await this.tasksService.createTask({
                title: value.title ?? '',
                description: value.description ?? '',
                dueDate: value.dueDate || null,
                priorityId: this.priorityIdByLabel[value.priority ?? 'Medium'] ?? 2,
                categoryId: value.category!,
                statusId: this.statusId(),
                assignedContactIds: value.assignedTo ?? [],
                subtasks: this.subtasks().map((title) => ({ title, status: false }))
            });

            this.created.emit();
            this.clearForm();
        } catch (e) {
            console.error('Failed to create task', e);
            this.error.set('Failed to create task. Please try again.');
        } finally {
            this.loading.set(false);
        }
    }
}
