import { booleanAttribute, Directive, input } from '@angular/core';

type ButtonVariant = 'primary' | 'outlined' | 'link' | 'icon';

/**
 * Applies the button styles to a `<button>` or `<a>`.
 *
 * With `variant` set to `null` no button styles are applied. `disabled` also
 * removes the element from the tab order and sets `aria-disabled`.
 */
@Directive({
    selector: 'button[uiButton], a[uiButton]',
    host: {
        '[class.button]': '!!variant()',
        '[class.button--primary]': 'variant() === "primary"',
        '[class.button--outlined]': 'variant() === "outlined"',
        '[class.button--link]': 'variant() === "link"',
        '[class.button--icon]': 'variant() === "icon"',
        '[class.button--disabled]': '!!variant() && disabled()',
        '[attr.disabled]': '!!variant() && disabled() ? "" : null',
        '[attr.aria-disabled]': '!!variant() && disabled() ? "true" : null',
        '[attr.tabindex]': '!!variant() && disabled() ? -1 : null'
    }
})
export class ButtonDirective {
    /** Visual style; `null` renders without button styles. */
    readonly variant = input<ButtonVariant | null>('primary');

    /** Disables the element and removes it from the tab order. */
    readonly disabled = input(false, { transform: booleanAttribute });
}
