import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';

@Component({
    selector: 'public-privacy-policy',
    imports: [LinkComponent, IconComponent],
    templateUrl: './privacy-policy.component.html',
    styleUrl: './privacy-policy.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent {}
