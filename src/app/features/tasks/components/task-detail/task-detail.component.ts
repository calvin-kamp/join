import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DialogComponent } from '@shared/ui/dialog/dialog.component';
import { IconComponent, type IconName } from '@shared/ui/icon/icon.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';
import { Subtask, TasksService, type Task } from '@features/tasks/tasks.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { CheckboxComponent } from '@shared/ui/forms/checkbox/checkbox.component';

/**
 * Dialog with all details of one task.
 *
 * Subtasks can be checked off directly; edit and delete are requested from
 * the parent via outputs.
 */
@Component({
    selector: 'tasks-task-detail',
    imports: [
        DialogComponent,
        IconComponent,
        InitialLetterComponent,
        DatePipe,
        ButtonComponent,
        CheckboxComponent
    ],
    templateUrl: './task-detail.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent {
    /** Shows the dialog when `true` and a task is set. */
    open = input<boolean>(false);

    /** Task to show. */
    task = input<Task | null>(null);

    /** Emits when the dialog should close. */
    close = output<void>();

    /** Emits the task when the user clicks "Edit". */
    editRequested = output<Task>();

    /** Emits the task when the user clicks "Delete". */
    deleteRequested = output<Task>();

    private tasksService = inject(TasksService);

    /** Icon name for a priority, e.g. `'Urgent'` → `'badge-urgent'`. */
    priorityIcon(priorityName: string): IconName {
        return ('badge-' + priorityName.toLowerCase()) as IconName;
    }

    /** BEM modifier class that colors the category badge, e.g. `task-detail__badge--user-story`. */
    categoryModifierClass(task: Task): string {
        const className = 'task-detail__badge--';
        const modifier = task.category.name.toLowerCase().replace(' ', '-');

        return className + modifier;
    }

    /** Saves the checked state of a subtask. */
    async onSubtaskChanged(subtask: Subtask, checked: boolean) {
        await this.tasksService.updateSubtask(subtask.id, {
            status: checked
        });
    }
}
