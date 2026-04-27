import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'public-entry',
    imports: [],
    templateUrl: './entry.component.html',
    styleUrl: './entry.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryComponent {}
