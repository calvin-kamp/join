import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { STATUS_IDS } from '@features/tasks/tasks.constants';
import { TasksService } from '@features/tasks/tasks.service';
import { IconComponent } from '@shared/ui/icon/icon.component';

const BOARD_LINK = '/tasks/board';
const GUEST_NAME = 'Guest';
/** Id of "Urgent" in the `priority` table. */
const URGENT_PRIORITY_ID = 1;

/** Duration of the mobile greeting intro in milliseconds. */
const INTRO_DURATION_MS = 1900;
/** The intro only plays below this width. */
const DESKTOP_QUERY = '(min-width: 80rem)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Summary page with task counts per status, urgent tasks and the next deadline.
 *
 * On mobile it first shows a full-screen greeting, unless the user prefers
 * reduced motion.
 */
@Component({
    selector: 'summary-dashboard',
    imports: [DatePipe, RouterLink, IconComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
    private readonly tasksService = inject(TasksService);
    private readonly authService = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly boardLink = BOARD_LINK;
    /** Greeting for the current time of day. */
    protected readonly greeting = greetingFor(new Date().getHours());

    protected readonly displayName = this.authService.displayName;
    /** `true` for the guest account; hides the name in the greeting. */
    protected readonly isGuest = computed(() => this.displayName() === GUEST_NAME);

    /** Number of tasks per status column. */
    protected readonly toDoCount = computed(() => this.countByStatus(STATUS_IDS.TODO));
    protected readonly inProgressCount = computed(() => this.countByStatus(STATUS_IDS.IN_PROGRESS));
    protected readonly awaitFeedbackCount = computed(() => this.countByStatus(STATUS_IDS.AWAIT_FEEDBACK));
    protected readonly doneCount = computed(() => this.countByStatus(STATUS_IDS.DONE));
    /** Number of all tasks on the board. */
    protected readonly boardCount = computed(() => this.tasksService.tasks().length);

    /** Urgent tasks that are not done yet. */
    private readonly openUrgentTasks = computed(() =>
        this.tasksService
            .tasks()
            .filter((task) => task.priority.id === URGENT_PRIORITY_ID && task.status.id !== STATUS_IDS.DONE)
    );

    /** Number of open urgent tasks. */
    protected readonly urgentCount = computed(() => this.openUrgentTasks().length);

    /** Earliest due date among open urgent tasks, `null` if there is none. */
    protected readonly upcomingDeadline = computed<Date | null>(() => {
        const timestamps = this.openUrgentTasks()
            .map((task) => task.dueDate)
            .filter((dueDate): dueDate is string => dueDate !== null)
            .map((dueDate) => new Date(dueDate).getTime())
            .sort((a, b) => a - b);

        return timestamps.length > 0 ? new Date(timestamps[0]) : null;
    });

    /** `true` while the mobile greeting intro is visible. */
    protected readonly introActive = signal(false);

    /** Loads the tasks and starts the intro. */
    ngOnInit(): void {
        void this.tasksService.getTasks();
        this.playIntro();
    }

    /** Number of tasks in the given status column. */
    private countByStatus(statusId: number): number {
        return this.tasksService.tasks().filter((task) => task.status.id === statusId).length;
    }

    /** Shows the intro for {@link INTRO_DURATION_MS}; skipped on desktop and with reduced motion. */
    private playIntro(): void {
        if (matchMedia(DESKTOP_QUERY).matches || matchMedia(REDUCED_MOTION_QUERY).matches) {
            return;
        }

        this.introActive.set(true);

        const timeout = setTimeout(() => this.introActive.set(false), INTRO_DURATION_MS);
        this.destroyRef.onDestroy(() => clearTimeout(timeout));
    }
}

/**
 * Greeting text for an hour of the day.
 *
 * @param hour - Hour from 0 to 23.
 */
function greetingFor(hour: number): string {
    if (hour >= 5 && hour < 12) {
        return 'Good morning';
    }

    if (hour >= 12 && hour < 18) {
        return 'Good afternoon';
    }

    return 'Good evening';
}
