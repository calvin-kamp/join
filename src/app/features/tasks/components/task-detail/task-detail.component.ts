import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DialogComponent } from '@shared/ui/dialog/dialog.component';
import { LinkComponent } from '@shared/ui/link/link.component';
import { IconComponent, type IconName } from '@shared/ui/icon/icon.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';
import { type Task } from '@features/tasks/tasks.service';
import { ButtonComponent } from '@shared/ui/button/button.component';

@Component({
    selector: 'tasks-task-detail',
    imports: [DialogComponent, LinkComponent, IconComponent, InitialLetterComponent, DatePipe, ButtonComponent],
    templateUrl: './task-detail.component.html',
    styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent {
    open = input<boolean>(false);
    task = input<Task | null>(null);
    close = output<void>();
    editRequested = output<Task>();
    deleteRequested = output<Task>();

    priorityIcon(priorityName: string): IconName {
        return ('badge-' + priorityName.toLowerCase()) as IconName;
    }

    categoryModifierClass(task: Task) {
        const className = 'task-detail__badge--';
        const modifier = task.category.name.toLowerCase().replace(' ', '-');

        return className + modifier;
    }
}
