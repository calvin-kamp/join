import { Component, inject, linkedSignal, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Task, TasksService, UpdateTaskPayload } from '../tasks.service';
import { TaskCardComponent } from '../components/task-card/task-card.component';
import { TaskFormDialogComponent } from '../components/task-form-dialog/task-form-dialog.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { BOARD_COLUMNS, STATUS_IDS } from '../tasks.constants';
import {
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragDrop,
    CdkDropList,
    moveItemInArray,
    transferArrayItem
} from '@angular/cdk/drag-drop';
import { TaskDetailComponent } from '../components/task-detail/task-detail.component';
import { SearchbarComponent } from '../components/searchbar/searchbar.component';

/**
 * Kanban board with one drag-and-drop column per status.
 *
 * Opens the task detail dialog on card click and the task form dialog for
 * creating and editing tasks.
 */
@Component({
    selector: 'tasks-board',
    imports: [
        SearchbarComponent,
        TaskCardComponent,
        TaskFormDialogComponent,
        IconComponent,
        CdkDropList,
        CdkDragPlaceholder,
        CdkDrag,
        TaskDetailComponent
    ],
    templateUrl: './board.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
    private readonly tasksService = inject(TasksService);

    protected readonly columns = BOARD_COLUMNS;
    protected readonly STATUS_IDS = STATUS_IDS;

    /**
     * Tasks grouped by status id.
     *
     * Rebuilt whenever the service's task list changes. It stays writable
     * because the CDK moves cards between these arrays directly on drop.
     */
    protected readonly columnTasks = linkedSignal(() => this.groupByColumn(this.tasksService.tasks()));

    /** Ids of all drop lists, so a card can be dropped into any column. */
    protected readonly dropListIds = this.columns.map((c) => this.dropListId(c.id));

    /** `true` while the task form dialog is open. */
    protected readonly dialogOpen = signal(false);

    /** Status that a newly created task gets. */
    protected readonly dialogStatusId = signal<number>(STATUS_IDS.TODO);

    /** Task shown in the form dialog for editing; `null` creates a new task. */
    protected readonly taskToEdit = signal<Task | null>(null);

    /** `true` while the task detail dialog is open. */
    detailOpen = signal(false);

    /** Task shown in the detail dialog. */
    protected readonly selectedTask = signal<Task | null>(null);

    /** `true` during a drag; suppresses the click that follows a drop. */
    private dragging = false;

    /** Loads the tasks each time the board is opened. */
    ngOnInit(): void {
        void this.tasksService.getTasks();
    }

    /** DOM id of the drop list for a status column. */
    dropListId(statusId: number): string {
        return `column-${statusId}`;
    }

    /**
     * Handles a card drop.
     *
     * Within a column it only reorders locally; across columns it also saves
     * the new status.
     */
    drop(event: CdkDragDrop<Task[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            return;
        }

        transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

        const newStatusId = Number(event.container.id.replace('column-', ''));
        this.updateTaskStatus(event.item.data, newStatusId);
    }

    /** Saves a new status for a task and keeps all other fields. */
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

    /**
     * Press duration before a drag starts.
     *
     * `0` on desktop; 270 ms below 1024 px, so touch users can still scroll.
     */
    dragDelayTime(): number {
        return window.innerWidth > 1024 ? 0 : 270;
    }

    /**
     * Opens the form dialog for a new task.
     *
     * @param statusId - Status column the new task is created in.
     */
    openDialogForColumn(statusId: number): void {
        this.taskToEdit.set(null);
        this.dialogStatusId.set(statusId);
        this.dialogOpen.set(true);
    }

    /** Closes the form dialog. */
    closeDialog(): void {
        this.dialogOpen.set(false);
        this.taskToEdit.set(null);
    }

    /** Switches from the detail dialog to the form dialog for editing `task`. */
    onEditTask(task: Task): void {
        this.detailOpen.set(false);
        this.taskToEdit.set(task);
        this.dialogStatusId.set(task.status.id);
        this.dialogOpen.set(true);
    }

    /** Closes the detail dialog and deletes `task`. */
    async onDeleteTask(task: Task): Promise<void> {
        this.detailOpen.set(false);
        await this.tasksService.deleteTask(task.id);
    }

    /**
     * Runs after the form dialog saved a task.
     *
     * After an edit it reopens the detail dialog with the updated task.
     */
    onFormSaved(): void {
        const editing = this.taskToEdit();

        if (!editing) {
            return;
        }

        const updated = this.tasksService.tasks().find((task) => task.id === editing.id);

        if (updated) {
            this.selectedTask.set(updated);
            this.detailOpen.set(true);
        }
    }

    /** Closes the detail dialog. */
    closeDetail() {
        this.detailOpen.set(false);
    }

    /** Marks the start of a drag. */
    onCardDragStarted(): void {
        this.dragging = true;
    }

    /** Clears the drag flag after the click event that follows the drop. */
    onCardDragEnded(): void {
        setTimeout(() => (this.dragging = false));
    }

    /** Opens the detail dialog on card click, unless the click ended a drag. */
    openFromCard(task: Task): void {
        if (this.dragging) {
            return;
        }

        this.openDetail(task);
    }

    /** Opens the detail dialog for `task`. */
    openDetail(task: Task): void {
        this.selectedTask.set(task);
        this.detailOpen.set(true);
    }

    /** Splits the task list into one array per board column. */
    private groupByColumn(tasks: Task[]): Record<number, Task[]> {
        const grouped: Record<number, Task[]> = {};

        for (const column of this.columns) {
            grouped[column.id] = tasks.filter((task) => task.status.id === column.id);
        }

        return grouped;
    }
}
