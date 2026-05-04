import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonDirective } from '@shared/directives/button.directive';

type ButtonType = 'button' | 'submit' | 'reset';
type ButtonVariant = 'primary' | 'outlined';

@Component({
    selector: 'ui-button',
    imports: [ButtonDirective],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
    type = input<ButtonType>('button');
    variant = input<ButtonVariant>('primary');
    disabled = input(false, { transform: booleanAttribute });
    btnClass = input<string>('');
}
