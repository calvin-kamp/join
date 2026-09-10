import { Component, input, ChangeDetectionStrategy } from '@angular/core';

type LogoVariant = 'dark' | 'light';

/** Join logo as inline SVG. */
@Component({
    selector: 'ui-logo',
    imports: [],
    templateUrl: './logo.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './logo.component.scss'
})
export class LogoComponent {
    /** `'light'` for dark backgrounds. */
    variant = input<LogoVariant>('dark');
}
