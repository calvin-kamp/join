import { Component, computed, inject, signal } from '@angular/core';
import { TasksService } from '@features/tasks/tasks.service';
import { BOARD_COLUMNS, STATUS_IDS } from '@features/tasks/tasks.constants';
import { TaskFormDialogComponent } from '@features/tasks/components/task-form-dialog/task-form-dialog.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
    selector: 'tasks-board',
    imports: [TaskFormDialogComponent, IconComponent],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent {
    private tasksService = inject(TasksService);

    protected readonly columns = BOARD_COLUMNS;
    protected readonly tasks = this.tasksService.tasks;

    // ── Dialog state ──────────────────────────────────────────────────────────
    protected readonly dialogOpen = signal(false);
    protected readonly dialogStatusId = signal<number>(STATUS_IDS.TODO);

    protected tasksByStatus = (statusId: number) =>
        computed(() => this.tasks().filter((t) => t.status.id === statusId));

    openDialogForColumn(statusId: number): void {
        this.dialogStatusId.set(statusId);
        this.dialogOpen.set(true);
    }

    closeDialog(): void {
        this.dialogOpen.set(false);
    }
}
