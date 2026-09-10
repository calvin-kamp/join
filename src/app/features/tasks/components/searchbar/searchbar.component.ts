import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TasksService, Task } from '@features/tasks/tasks.service';
import { InputComponent } from '@shared/ui/forms/input/input.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

/**
 * Search field above the board; filters tasks by title and description.
 */
@Component({
    selector: 'tasks-searchbar',
    imports: [ReactiveFormsModule, InputComponent, IconComponent],
    templateUrl: './searchbar.component.html',
    styleUrl: './searchbar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarComponent {
    readonly taskService = inject(TasksService);

    /** Search input. */
    searchControl = new FormControl('');

    /** Copy of the task list taken on the first keystroke; the filter runs on this copy. */
    allTasks: Task[] = [];

    /** `true` when the last search found nothing. */
    showErrorMessage = signal<boolean>(false);

    /** Filters on every change of the search input. */
    constructor() {
        this.searchControl.valueChanges.subscribe((value) => {
            this.filterTasks(value ?? '');
        });
    }

    /**
     * Writes the tasks that contain `term` into the service's task list.
     *
     * An empty term leaves the list unchanged.
     */
    private filterTasks(term: string) {
        const lowerTerm = term.toLowerCase().trim();

        // Beim ersten Tipp, Backup der Original-Tasks erstellen
        if (this.allTasks.length === 0) {
            this.allTasks = this.taskService.tasks();
        }

        // Suchfeld leer: Originale Liste wiederherstellen
        if (!lowerTerm) {
            return;
        }

        // Filtern
        const filtered = this.allTasks.filter(
            (t) =>
                t.title?.toLowerCase().includes(lowerTerm) || (t as any).description?.toLowerCase().includes(lowerTerm)
        );

        this.showErrorMessage.set(filtered.length === 0);
        this.taskService.tasks.set(filtered);
    }

    /** Runs the search once more and clears the input (search icon click). */
    loadTasks() {
        this.filterTasks(this.searchControl.value ?? '');
        this.searchControl.setValue('');
    }
}
