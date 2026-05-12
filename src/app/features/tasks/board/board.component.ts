import { Component, inject } from '@angular/core';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { Task, TasksService } from '../tasks.service';
import { TaskCardComponent } from '../components/task-card/task-card.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';

@Component({
    selector: 'tasks-board',
    imports: [SearchbarComponent, TaskCardComponent, IconComponent, LinkComponent],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent {
    tasksService = inject(TasksService);
}
