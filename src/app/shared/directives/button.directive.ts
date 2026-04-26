import { booleanAttribute, Directive, input } from '@angular/core';

type ButtonVariant = 'primary' | 'outlined';

@Directive({
    selector: 'button[uiButton], a[uiButton]',
    host: {
        '[class.button]': '!!variant()',
        '[class.button--primary]': 'variant() === "primary"',
        '[class.button--outlined]': 'variant() === "outlined"',
        '[class.button--disabled]': '!!variant() && disabled()',
        '[attr.disabled]': '!!variant() && disabled() ? "" : null',
        '[attr.aria-disabled]': '!!variant() && disabled() ? "true" : null',
        '[attr.tabindex]': '!!variant() && disabled() ? -1 : null'
    }
})
export class ButtonDirective {
    readonly variant = input<ButtonVariant | null>('primary');
    readonly disabled = input(false, { transform: booleanAttribute });
}
