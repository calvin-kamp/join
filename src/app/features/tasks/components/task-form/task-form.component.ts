import {
    Component,
    computed,
    inject,
    input,
    OnChanges,
    OnInit,
    output,
    signal,
    SimpleChanges,
    ChangeDetectionStrategy
} from '@angular/core';
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
import { TasksService, type Task, type EditTaskPayload } from '@features/tasks/tasks.service';
import { STATUS_IDS } from '@features/tasks/tasks.constants';
import { ToastService } from '@shared/services/toast.service';

/** Priority option shown as radio button. */
export interface Priority {
    label: string;
    iconName: IconName;
    /** CSS color of the selected radio button. */
    fillColor: string;
}

/**
 * Form to create or edit a task.
 *
 * Used on the add-task page and inside the task form dialog. Without a
 * `task` input it creates a new task; with one it edits that task.
 */
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
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnChanges, OnInit {
    private fb = inject(FormBuilder);
    private tasksService = inject(TasksService);
    contactsService = inject(ContactsService);
    toast = inject(ToastService);

    /** Contacts that can be assigned. */
    contacts = this.contactsService.contacts;

    /** Shows the close button in the header (used inside the dialog). */
    showClose = input<boolean>(false);

    /** Status a new task is created with. Ignored when editing. */
    statusId = input<number>(STATUS_IDS.TODO);

    /** Task to edit; `null` creates a new task. */
    task = input<Task | null>(null);

    /** Emits when the user closes or cancels the form. */
    close = output<void>();

    /** Emits after a task was created or saved successfully. */
    created = output<void>();

    private readonly editingTask = signal<Task | null>(null);

    /** `'edit'` while a task is being edited, `'add'` otherwise. */
    readonly formType = computed<'add' | 'edit'>(() => (this.editingTask() ? 'edit' : 'add'));

    /** Error text of the last failed save, `null` otherwise. */
    error = signal<string | null>(null);

    /** `true` while a save request is running; disables the submit button. */
    loading = signal<boolean>(false);

    /** Category options; ids match the `category` table. */
    categories: SelectOption[] = [
        { name: 'Technical Task', id: 1 },
        { name: 'User Story', id: 2 }
    ];

    /** Priority radio options in display order. */
    priorities: Priority[] = [
        { label: 'Urgent', iconName: 'badge-urgent', fillColor: 'var(--color-priority-urgent)' },
        { label: 'Medium', iconName: 'badge-medium', fillColor: 'var(--color-priority-medium)' },
        { label: 'Low', iconName: 'badge-low', fillColor: 'var(--color-priority-low)' }
    ];

    /** Maps priority labels to their ids in the `priority` table. */
    private readonly priorityIdByLabel: Record<string, number> = {
        Urgent: 1,
        Medium: 2,
        Low: 3
    };

    /** Task form model. `priority` holds the label, `category` the id. */
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

    /** Ids of the currently assigned contacts. */
    assignedContactIds = toSignal(this.taskForm.controls.assignedTo.valueChanges, {
        initialValue: this.taskForm.controls.assignedTo.value
    });

    /** Full contact objects of the assigned ids, for the avatar preview. */
    assignedContacts = computed(() => {
        const selectedIds = this.assignedContactIds();
        return this.contacts().filter((contact) => {
            if (contact.id === undefined) return false;
            return selectedIds.includes(contact.id);
        });
    });

    // ── Subtasks ──────────────────────────────────────────────────────────────

    /** Titles of the subtasks; saved together with the task. */
    subtasks = signal<string[]>([]);

    /** Index of the subtask in inline edit mode, `null` if none. */
    editingSubtaskIndex = signal<number | null>(null);

    /** Current text of the subtask in inline edit mode. */
    editingSubtaskValue = signal<string>('');

    /** Loads the assignable contacts each time the form is created. */
    ngOnInit(): void {
        void this.contactsService.getContacts();
    }

    /** Adds a subtask to the end of the list. */
    addSubtask(title: string): void {
        this.subtasks.update((list) => [...list, title]);
    }

    /** Removes the subtask at `index`. */
    removeSubtask(index: number): void {
        this.subtasks.update((list) => list.filter((_, i) => i !== index));
    }

    /** Switches the subtask at `index` into inline edit mode. */
    startEditSubtask(index: number): void {
        this.editingSubtaskIndex.set(index);
        this.editingSubtaskValue.set(this.subtasks()[index]);
    }

    /** Saves the inline edit; an empty text is ignored and keeps edit mode open. */
    confirmEditSubtask(): void {
        const idx = this.editingSubtaskIndex();
        const val = this.editingSubtaskValue().trim();
        if (idx === null || !val) return;
        this.subtasks.update((list) => list.map((item, i) => (i === idx ? val : item)));
        this.editingSubtaskIndex.set(null);
    }

    /** Leaves inline edit mode without saving. */
    cancelEditSubtask(): void {
        this.editingSubtaskIndex.set(null);
    }

    /** Fills or clears the form whenever the `task` input changes. */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['task']) {
            this.applyTask(this.task());
        }
    }

    /** Fills the form with `task`, or clears it for `null`. */
    private applyTask(task: Task | null): void {
        if (!task) {
            this.editingTask.set(null);
            this.clearForm();
            return;
        }

        this.editingTask.set(task);

        this.taskForm.reset({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate ?? '',
            assignedTo: task.assignedTo.map((contact) => contact.id).filter((id): id is number => id !== undefined),
            priority: task.priority.name || 'Medium',
            category: task.category.id
        });

        this.subtasks.set(task.subtasks.map((subtask) => subtask.title));
        this.editingSubtaskIndex.set(null);
        this.editingSubtaskValue.set('');
        this.error.set(null);
    }

    /** Resets all fields to their defaults and removes all error messages. */
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

    /** Emits {@link close}. */
    onCloseClick(): void {
        this.close.emit();
    }

    /**
     * Validates the form and creates or saves the task.
     *
     * Invalid fields are marked and show their error message instead.
     * Emits {@link created} on success.
     */
    async onSubmit(): Promise<void> {
        this.taskForm.markAllAsTouched();
        if (this.taskForm.invalid) return;

        this.loading.set(true);
        this.error.set(null);

        const value = this.taskForm.getRawValue();
        const editing = this.editingTask();

        try {
            if (editing) {
                await this.tasksService.editTask(editing.id, {
                    title: value.title ?? '',
                    description: value.description ?? '',
                    dueDate: value.dueDate || null,
                    priorityId: this.priorityIdByLabel[value.priority ?? 'Medium'] ?? 2,
                    categoryId: value.category!,
                    assignedContactIds: value.assignedTo ?? [],
                    subtasks: this.subtasks().map((title) => ({ title }))
                } satisfies EditTaskPayload);

                this.created.emit();
            } else {
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
                this.toast.show('Task added to board', '/assets/icons/nav-board.svg');
            }
        } catch (e) {
            console.error('Failed to save task', e);
            this.error.set('Failed to save task. Please try again.');
        } finally {
            this.loading.set(false);
        }
    }
}
