import { Component, input } from '@angular/core';

type LogoVariant = 'dark' | 'light';

@Component({
    selector: 'ui-logo',
    imports: [],
    templateUrl: './logo.component.html',
    styleUrl: './logo.component.scss'
})
export class LogoComponent {
    variant = input<LogoVariant>('dark');
}

