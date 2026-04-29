import { Component, input } from '@angular/core';

// placeholder icon-names
type IconName =
    | 'arrow-left'
    | 'help-question'
    | 'nav-summary'
    | 'nav-board'
    | 'nav-add-task'
    | 'nav-contacts'
    | 'nav-login'
    | 'add-contact'
    | 'close'
    | 'plus'
    | 'chevron-down'
    | 'chevron-up'
    | 'mail'
    | 'lock'
    | 'password-visible'
    | 'person'
    | 'password-hidden'
    | 'pen-solid'
    | 'pen-outline'
    | 'check-solid'
    | 'check-outline'
    | 'calender'
    | 'trash'
    | 'badge-urgent'
    | 'badge-medium'
    | 'badge-low'
    | 'search'
    | 'search-hovered'
    | 'board-add-task'
    | 'board-add-task-hovered'
    | 'phone';

@Component({
    selector: 'ui-icon',
    imports: [],
    templateUrl: './icon.component.html',
    styleUrl: './icon.component.scss'
})
export class IconComponent {
    name = input.required<IconName>();
    width = input.required<number>();
    height = input.required<number>();
}
