import { Component, effect, inject, signal } from '@angular/core';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { Task, TasksService, UpdateTaskPayload } from '../tasks.service';
import { TaskCardComponent } from '../components/task-card/task-card.component';
import { TaskFormDialogComponent } from '../components/task-form-dialog/task-form-dialog.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';
import { BOARD_COLUMNS, STATUS_IDS } from '../tasks.constants';
import {
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragDrop,
    CdkDropList,
    moveItemInArray,
    transferArrayItem
} from '@angular/cdk/drag-drop';

@Component({
    selector: 'tasks-board',
    imports: [
        SearchbarComponent,
        TaskCardComponent,
        TaskFormDialogComponent,
        IconComponent,
        LinkComponent,
        CdkDropList,
        CdkDragPlaceholder,
        CdkDrag
    ],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent {
    private readonly tasksService = inject(TasksService);

    protected readonly columns = BOARD_COLUMNS;
    protected readonly STATUS_IDS = STATUS_IDS;

    // Tasks grouped by status id. The template loops over `columns` and
    // looks up the matching task list via `columnTasks[column.id]`. The
    // references get rebuilt whenever the `tasks` signal changes — CDK is
    // fine with that because it reads `cdkDropListData` fresh on each drop.
    protected columnTasks: Record<number, Task[]> = Object.fromEntries(BOARD_COLUMNS.map((c) => [c.id, [] as Task[]]));

    // Ids of every drop list in the board, used so each column can receive
    // dragged items from any other column.
    protected readonly dropListIds = this.columns.map((c) => this.dropListId(c.id));

    // Dialog state
    protected readonly dialogOpen = signal(false);
    protected readonly dialogStatusId = signal<number>(STATUS_IDS.TODO);

    constructor() {
        effect(() => {
            const tasks = this.tasksService.tasks();
            const next: Record<number, Task[]> = {};

            for (const column of this.columns) {
                next[column.id] = tasks.filter((task) => task.status.id === column.id);
            }

            this.columnTasks = next;
        });
    }

    dropListId(statusId: number): string {
        return `column-${statusId}`;
    }

    drop(event: CdkDragDrop<Task[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            return;
        }

        transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

        const newStatusId = Number(event.container.id.replace('column-', ''));
        this.updateTaskStatus(event.item.data, newStatusId);
    }

    updateTaskStatus(task: Task, newStatus: number): void {
        const updatedTask: UpdateTaskPayload = {
            title: task.title,
            description: task.description,
            due_date: task.dueDate,
            priority: task.priority.id,
            category: task.category.id,
            created_by: task.createdBy,
            status: newStatus
        };

        this.tasksService.updateTask(updatedTask, task.id);
    }

    dragDelayTime(): number {
        return window.innerWidth > 1024 ? 0 : 270;
    }

    openDialogForColumn(statusId: number): void {
        this.dialogStatusId.set(statusId);
        this.dialogOpen.set(true);
    }

    closeDialog(): void {
        this.dialogOpen.set(false);
    }
}
