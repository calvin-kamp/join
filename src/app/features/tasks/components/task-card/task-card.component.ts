import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Task } from '@features/tasks/tasks.service';
import { CardDirective } from '@shared/directives/card.directive';
import { IconComponent, IconName } from '@shared/ui/icon/icon.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';

/**
 * Board card with category, title, subtask progress, assignees and priority.
 */
@Component({
    selector: 'tasks-task-card',
    imports: [IconComponent, InitialLetterComponent, CardDirective],
    templateUrl: './task-card.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
    /** Task to show. */
    readonly task = input.required<Task>();

    /** BEM modifier class that colors the category badge, e.g. `task-card__badge--user-story`. */
    categoryModifierClass() {
        const className = 'task-card__badge--';
        const modifier = this.task().category.name.toLowerCase().replace(' ', '-');

        return className + modifier;
    }

    /** Number of done subtasks. */
    subtasksDone(): number {
        let count = 0;

        for (const subtask of this.task().subtasks) {
            if (subtask.status) {
                count++;
            }
        }

        return count;
    }

    /** Icon name for the task's priority, e.g. `'badge-urgent'`. */
    getBadgeName(): IconName {
        return ('badge-' + this.task().priority.name.toLowerCase()) as IconName;
    }

    /** Width of the progress bar fill in px (full bar = 110 px). */
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

    /** First four assignees; the rest is shown as a counter. */
    visibleContacts() {
        return this.task().assignedTo.slice(0, 4);
    }

    /** Number of assignees beyond the first four. */
    hiddenContactsCount(): number {
        const total = this.task().assignedTo.length;

        return total > 4 ? total - 4 : 0;
    }
}
