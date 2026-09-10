import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DialogComponent } from '@shared/ui/dialog/dialog.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { STATUS_IDS } from '@features/tasks/tasks.constants';
import { type Task } from '@features/tasks/tasks.service';

/**
 * Task form inside a modal dialog.
 *
 * The form is created on every opening, so it always starts empty (or with
 * the task to edit) and without old error messages.
 */
@Component({
    selector: 'tasks-task-form-dialog',
    imports: [DialogComponent, TaskFormComponent],
    templateUrl: './task-form-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './task-form-dialog.component.scss'
})
export class TaskFormDialogComponent {
    /** Opens the dialog when `true`. */
    open = input<boolean>(false);

    /** Status a new task is created with. */
    statusId = input<number>(STATUS_IDS.TODO);

    /** Task to edit; `null` creates a new task. */
    task = input<Task | null>(null);

    /** Emits when the dialog should close. */
    close = output<void>();

    /** Emits after the task was saved; the dialog closes afterwards. */
    created = output<void>();

    /** Forwards a close request from the dialog or the form. */
    onCloseRequested(): void {
        this.close.emit();
    }

    /** Emits {@link created} and closes the dialog. */
    onTaskCreated(): void {
        this.created.emit();
        this.close.emit();
    }
}
