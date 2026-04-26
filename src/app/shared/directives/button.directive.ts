import { booleanAttribute, Directive, input } from '@angular/core';

type ButtonVariant = 'primary' | 'outlined';

@Directive({
    selector: 'button[uiButton], a[uiButton]',
    host: {
        class: 'button',
        '[class.button--primary]': 'variant() === "primary"',
        '[class.button--outlined]': 'variant() === "outlined"',
        '[class.button--disabled]': 'disabled()',
        '[attr.disabled]': 'disabled() ? "" : null',
        '[attr.aria-disabled]': 'disabled() ? "true" : null',
        '[attr.tabindex]': 'disabled() ? -1 : null'
    }
})
export class ButtonDirective {
    variant = input<ButtonVariant>('primary');
    disabled = input(false, { transform: booleanAttribute });
}
