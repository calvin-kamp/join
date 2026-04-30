import { Component } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';

@Component({
    selector: 'public-help',
    imports: [LinkComponent, IconComponent],
    templateUrl: './help.component.html',
    styleUrl: './help.component.scss'
})
export class HelpComponent {}
