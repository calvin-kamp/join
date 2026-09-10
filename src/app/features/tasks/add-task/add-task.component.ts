import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TaskFormComponent } from '../components/task-form/task-form.component';
import { STATUS_IDS } from '../tasks.constants';

/**
 * Add-task page (`/tasks/add-task`).
 *
 * New tasks always start in "To do". After a successful create it navigates
 * to the board.
 */
@Component({
    selector: 'tasks-add-task',
    imports: [TaskFormComponent],
    templateUrl: './add-task.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './add-task.component.scss'
})
export class AddTaskComponent {
    private readonly router = inject(Router);

    /** Status every task created on this page gets. */
    protected readonly todoStatusId = STATUS_IDS.TODO;

    /** Navigates to the board after the task was created. */
    protected async onCreated(): Promise<void> {
        await this.router.navigateByUrl('/tasks/board');
    }
}
