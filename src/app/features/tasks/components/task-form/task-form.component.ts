import {
    Component,
    computed,
    inject,
    input,
    OnChanges,
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
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private tasksService = inject(TasksService);
    contactsService = inject(ContactsService);
    toast = inject(ToastService);

    contacts = this.contactsService.contacts;

    showClose = input<boolean>(false);
    statusId = input<number>(STATUS_IDS.TODO);
    task = input<Task | null>(null);
    close = output<void>();
    created = output<void>();

    private readonly editingTask = signal<Task | null>(null);
    readonly formType = computed<'add' | 'edit'>(() => (this.editingTask() ? 'edit' : 'add'));

    error = signal<string | null>(null);
    loading = signal<boolean>(false);

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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['task']) {
            this.applyTask(this.task());
        }
    }

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
