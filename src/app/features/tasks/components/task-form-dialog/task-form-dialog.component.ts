import { Component, input, output } from '@angular/core';
import { DialogComponent } from '@shared/ui/dialog/dialog.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { STATUS_IDS } from '@features/tasks/tasks.constants';
import { type Task } from '@features/tasks/tasks.service';

@Component({
    selector: 'tasks-task-form-dialog',
    imports: [DialogComponent, TaskFormComponent],
    templateUrl: './task-form-dialog.component.html',
    styleUrl: './task-form-dialog.component.scss'
})
export class TaskFormDialogComponent {
    open = input<boolean>(false);
    statusId = input<number>(STATUS_IDS.TODO);
    task = input<Task | null>(null);
    close = output<void>();
    created = output<void>();

    onCloseRequested(): void {
        this.close.emit();
    }

    onTaskCreated(): void {
        this.created.emit();
        this.close.emit();
    }
}
