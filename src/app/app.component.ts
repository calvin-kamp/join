import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TasksService } from '@features/board/tasks.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, JsonPipe],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    protected readonly title = signal('join');

    t = inject(TasksService);
}
