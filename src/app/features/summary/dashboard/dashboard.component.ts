import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { STATUS_IDS } from '@features/tasks/tasks.constants';
import { TasksService } from '@features/tasks/tasks.service';
import { IconComponent } from '@shared/ui/icon/icon.component';

const BOARD_LINK = '/tasks/board';
const GUEST_NAME = 'Guest';
const URGENT_PRIORITY_ID = 1;

const INTRO_DURATION_MS = 1900;
const DESKTOP_QUERY = '(min-width: 80rem)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

@Component({
    selector: 'summary-dashboard',
    imports: [DatePipe, RouterLink, IconComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
    private readonly tasksService = inject(TasksService);
    private readonly authService = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly boardLink = BOARD_LINK;
    protected readonly greeting = greetingFor(new Date().getHours());

    protected readonly displayName = this.authService.displayName;
    protected readonly isGuest = computed(() => this.displayName() === GUEST_NAME);

    protected readonly toDoCount = computed(() => this.countByStatus(STATUS_IDS.TODO));
    protected readonly inProgressCount = computed(() => this.countByStatus(STATUS_IDS.IN_PROGRESS));
    protected readonly awaitFeedbackCount = computed(() => this.countByStatus(STATUS_IDS.AWAIT_FEEDBACK));
    protected readonly doneCount = computed(() => this.countByStatus(STATUS_IDS.DONE));
    protected readonly boardCount = computed(() => this.tasksService.tasks().length);

    private readonly openUrgentTasks = computed(() =>
        this.tasksService
            .tasks()
            .filter((task) => task.priority.id === URGENT_PRIORITY_ID && task.status.id !== STATUS_IDS.DONE)
    );

    protected readonly urgentCount = computed(() => this.openUrgentTasks().length);

    protected readonly upcomingDeadline = computed<Date | null>(() => {
        const timestamps = this.openUrgentTasks()
            .map((task) => task.dueDate)
            .filter((dueDate): dueDate is string => dueDate !== null)
            .map((dueDate) => new Date(dueDate).getTime())
            .sort((a, b) => a - b);

        return timestamps.length > 0 ? new Date(timestamps[0]) : null;
    });

    protected readonly introActive = signal(false);

    constructor() {
        this.playIntro();
    }

    private countByStatus(statusId: number): number {
        return this.tasksService.tasks().filter((task) => task.status.id === statusId).length;
    }

    private playIntro(): void {
        if (matchMedia(DESKTOP_QUERY).matches || matchMedia(REDUCED_MOTION_QUERY).matches) {
            return;
        }

        this.introActive.set(true);

        const timeout = setTimeout(() => this.introActive.set(false), INTRO_DURATION_MS);
        this.destroyRef.onDestroy(() => clearTimeout(timeout));
    }
}

function greetingFor(hour: number): string {
    if (hour >= 5 && hour < 12) {
        return 'Good morning';
    }

    if (hour >= 12 && hour < 18) {
        return 'Good afternoon';
    }

    return 'Good evening';
}
