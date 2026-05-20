import { Component, effect, inject } from '@angular/core';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { Task, TasksService, UpdateTaskPayload } from '../tasks.service';
import { TaskCardComponent } from '../components/task-card/task-card.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';
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
    tasksService = inject(TasksService);

    toDoColumn: Task[] = [];
    progressColumn: Task[] = [];
    feedbackColumn: Task[] = [];
    doneColumn: Task[] = [];

    constructor() {
        effect(() => {
            const tasks = this.tasksService.tasks();

            this.toDoColumn = tasks.filter((task) => task.status.id === 1);
            this.progressColumn = tasks.filter((task) => task.status.id === 2);
            this.feedbackColumn = tasks.filter((task) => task.status.id === 3);
            this.doneColumn = tasks.filter((task) => task.status.id === 4);
        });
    }

    drop(event: CdkDragDrop<Task[]>) {
        const statusMap: Record<string, number> = {
            todo: 1,
            progress: 2,
            feedback: 3,
            done: 4
        };

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );

            this.updateTaskStatus(event.item.data, statusMap[event.container.id]);
        }
    }

    updateTaskStatus(task: Task, newStatus: number) {
        let updatedTask: UpdateTaskPayload = {
            title: task.title,
            description: task.description,
            due_date: task.due_date,
            priority: task.priority.id,
            category: task.category.id,
            created_by: task.created_by,
            status: newStatus
        };

        this.tasksService.updateTask(updatedTask, task.id);
    }

    dragDelayTime() {
        if (window.innerWidth > 1024) {
            return 0;
        }

        return 270;
    }
}
