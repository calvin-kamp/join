import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';

/** Static help page. */
@Component({
    selector: 'public-help',
    imports: [LinkComponent, IconComponent],
    templateUrl: './help.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './help.component.scss'
})
export class HelpComponent {}
