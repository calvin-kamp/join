import { Component, inject } from '@angular/core';
import { ContactsService } from '@features/contacts/contacts.service';
import { InputComponent } from '@shared/ui/forms/input/input.component';
import { RadioComponent } from '@shared/ui/forms/radio/radio.component';
import { TextareaComponent } from '@shared/ui/forms/textarea/textarea.component';
import { type IconName, IconComponent } from '@shared/ui/icon/icon.component';

export interface Priority {
    name: string;
    iconName: IconName;
    fillColor: string;
    checked?: boolean;
}

@Component({
    selector: 'tasks-add-task',
    imports: [InputComponent, TextareaComponent, RadioComponent, IconComponent],
    templateUrl: './add-task.component.html',
    styleUrl: './add-task.component.scss'
})
export class AddTaskComponent {
    contactsService = inject(ContactsService);

    priorities: Priority[] = [
        {
            name: 'Urgent',
            iconName: 'badge-urgent',
            fillColor: 'var(--color-priority-urgent)'
        },
        {
            name: 'Medium',
            iconName: 'badge-medium',
            fillColor: 'var(--color-priority-medium)',
            checked: true
        },
        {
            name: 'Low',
            iconName: 'badge-low',
            fillColor: 'var(--color-priority-low)'
        }
    ];

    categories: string[] = ['User Story', 'Technical Task'];
}
