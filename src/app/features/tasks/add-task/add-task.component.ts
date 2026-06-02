import { Component } from '@angular/core';
import { TaskFormComponent } from '../components/task-form/task-form.component';
import { STATUS_IDS } from '../tasks.constants';

@Component({
    selector: 'tasks-add-task',
    imports: [TaskFormComponent],
    templateUrl: './add-task.component.html',
    styleUrl: './add-task.component.scss'
})
export class AddTaskComponent {
    // Tasks created from the /add-task route always land in the "To do" column.
    protected readonly todoStatusId = STATUS_IDS.TODO;
}
