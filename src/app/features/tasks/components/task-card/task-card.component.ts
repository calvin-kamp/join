import { Component, input } from '@angular/core';
import { Task } from '@features/tasks/tasks.service';
import { CardDirective } from '@shared/directives/card.directive';
import { IconComponent, IconName } from '@shared/ui/icon/icon.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';

@Component({
    selector: 'tasks-task-card',
    imports: [IconComponent, InitialLetterComponent, CardDirective],
    templateUrl: './task-card.component.html',
    styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
    readonly task = input.required<Task>();

    categoryModifierClass() {
        const className = 'task-card__badge--';
        const modifier = this.task().category.name.toLowerCase().replace(' ', '-');

        return className + modifier;
    }

    subtasksDone(): number {
        let count = 0;

        for (const subtask of this.task().subtasks) {
            if (subtask.status) {
                count++;
            }
        }

        return count;
    }

    getBadgeName(): IconName {
        return ('badge-' + this.task().priority.name.toLowerCase()) as IconName;
    }

    setProgress(): number {
        const subtasks = this.task().subtasks;

        if (!subtasks.length) return 0;

        let done = 0;

        for (const task of subtasks) {
            if (task.status) {
                done++;
            }
        }

        const percent = done / subtasks.length;

        return percent * 110;
    }

    visibleContacts() {
        return this.task().contacts.slice(0, 4);
    }

    hiddenContactsCount(): number {
        const total = this.task().contacts.length;

        return total > 4 ? total - 4 : 0;
    }
}
