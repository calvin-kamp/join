import { Directive, input } from '@angular/core';

type CardVariant = '' | 'lg';

@Directive({
    selector: '[uiCard]',
    host: {
        class: 'card',
        '[class.card--lg]': 'variant() === "lg"'
    }
})
export class CardDirective {
    variant = input<CardVariant>('');
}
