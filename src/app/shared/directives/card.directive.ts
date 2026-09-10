import { Directive, input } from '@angular/core';

type CardVariant = '' | 'lg';

/** Applies the card styles (`.card`, `.card--lg`) to its host. */
@Directive({
    selector: '[uiCard]',
    host: {
        class: 'card',
        '[class.card--lg]': 'variant() === "lg"'
    }
})
export class CardDirective {
    /** `'lg'` for the larger card variant. */
    variant = input<CardVariant>('');
}
