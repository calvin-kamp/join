import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'summary-dashboard',
    imports: [],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {}
