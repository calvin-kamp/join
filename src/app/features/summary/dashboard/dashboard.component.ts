import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
    selector: 'summary-dashboard',
    imports: [IconComponent, IconComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
    taskAmount = 16;
}
