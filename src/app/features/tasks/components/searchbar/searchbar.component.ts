import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TasksService, Task } from '@features/tasks/tasks.service';
import { InputComponent } from '@shared/ui/forms/input/input.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
    selector: 'tasks-searchbar',
    imports: [ReactiveFormsModule, InputComponent, IconComponent],
    templateUrl: './searchbar.component.html',
    styleUrl: './searchbar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarComponent {
    readonly taskService = inject(TasksService);

    searchControl = new FormControl('');
    allTasks: Task[] = [];
    showErrorMessage = signal<boolean>(false) ;

    constructor() {
        this.searchControl.valueChanges.subscribe((value) => {
            this.filterTasks(value ?? '');
        });
    }

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

        if(filtered.length === 0) {
          this.showErrorMessage.set(true)
        }
        this.taskService.tasks.set(filtered);
    }

    loadTasks() {
        this.filterTasks(this.searchControl.value ?? '');
        this.searchControl.setValue('');
    }
}
