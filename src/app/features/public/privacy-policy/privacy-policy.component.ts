import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'public-privacy-policy',
    imports: [],
    templateUrl: './privacy-policy.component.html',
    styleUrl: './privacy-policy.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent {}
