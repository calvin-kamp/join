import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'public-legal-notice',
    imports: [],
    templateUrl: './legal-notice.component.html',
    styleUrl: './legal-notice.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegalNoticeComponent {}
