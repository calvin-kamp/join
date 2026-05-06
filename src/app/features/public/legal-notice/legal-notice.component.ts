import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LinkComponent } from '@shared/ui/link/link.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
    selector: 'public-legal-notice',
    imports: [LinkComponent, IconComponent, IconComponent],
    templateUrl: './legal-notice.component.html',
    styleUrl: './legal-notice.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegalNoticeComponent {}
