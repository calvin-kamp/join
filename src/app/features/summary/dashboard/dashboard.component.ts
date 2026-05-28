import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TasksService } from '@features/tasks/tasks.service';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
    selector: 'summary-dashboard',
    imports: [IconComponent, IconComponent, JsonPipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
    taskService = inject(TasksService);

    urgentAmount() {
        let urgentAmount = 0;
        for (const task of this.taskService.tasks()) {
            if (task.priority.id == 1) {
                urgentAmount++;
            } else {
                urgentAmount;
            }
        }
        return urgentAmount;
    }

    upcomingDeadlineInDays() {
        let deadlines: Date[] = [];
        for (const task of this.taskService.tasks()) {
            if (task.due_date) {
                deadlines.push(new Date(task.due_date));
            }
        }

        let importantDate: Date = new Date();
        for (const deadline of deadlines) {
            if (importantDate < deadline) {
                importantDate = deadline;
            }
        }

        const urgentDate =
            importantDate.toLocaleString('default', { month: 'long' }) +
            ' ' +
            importantDate.getDate() +
            ', ' +
            importantDate.getFullYear();
        return urgentDate;
    }

    toDoAmount() {
        let taskAmountToDo = 0;
        for (const task of this.taskService.tasks()) {
            if (task.status.name == 'To do') {
                taskAmountToDo++;
            }
        }
        return taskAmountToDo;
    }

    tasksOnBoard() {
        let onBoardAmount = 0;
        for (const task of this.taskService.tasks()) {
            if (task.id == 1 || 2 || 3) {
                onBoardAmount++;
            } else {
                onBoardAmount;
            }
        }
        return onBoardAmount;
    }

    inProgress() {
        let inProgressAmount = 0;
        for (const task of this.taskService.tasks()) {
            if (task.status.name == 'In progress') {
                inProgressAmount++;
            } else {
                inProgressAmount;
            }
        }
        return inProgressAmount;
    }

    awaitFeedback() {
        let feedbackAmount = 0;
        for (const task of this.taskService.tasks()) {
            if (task.status.name == 'Await feedback') {
                feedbackAmount++;
            }
        }
        return feedbackAmount;
    }

    done() {
        let taskDoneAmount = 0;
        for (const task of this.taskService.tasks()) {
            if (task.status.name == 'Done') {
                taskDoneAmount++;
            } else {
                taskDoneAmount;
            }
        }
        return taskDoneAmount;
    }

    greetings() {
        let timeHour = new Date().getHours();
        let greets: string[] = ['Good Morning', 'Good Afternoon', 'Good Evening'];
        let greetmsg: string = '';

        if (timeHour > 5 && timeHour < 12) {
            greetmsg = greets[0];
        }

        if (timeHour >= 12 && timeHour < 18) {
            greetmsg = greets[1];
        }

        if (timeHour >= 18 && timeHour < 0) {
            greetmsg = greets[2];
        }

        if (timeHour >= 0 && timeHour < 5) {
            greetmsg = greets[2];
        }
        return greetmsg;
    }
}
