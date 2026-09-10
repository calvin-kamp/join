import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonDirective } from '@shared/directives/button.directive';

type ButtonType = 'button' | 'submit' | 'reset';
type ButtonVariant = 'primary' | 'outlined' | 'link' | 'icon';

/**
 * Button with the app's button styles.
 *
 * The host element has `display: contents`, so layout styles must target the
 * inner button via `btnClass`.
 */
@Component({
    selector: 'ui-button',
    imports: [ButtonDirective],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
    /** Native button type; use `'submit'` inside forms. */
    type = input<ButtonType>('button');

    /** Visual style. */
    variant = input<ButtonVariant>('primary');

    /** Disables the button. */
    disabled = input(false, { transform: booleanAttribute });

    /** Extra classes for the inner `<button>`. */
    btnClass = input<string>('');
}
