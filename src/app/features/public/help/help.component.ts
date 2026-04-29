import { Component } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'public-help',
    imports: [LinkComponent, IconComponent, RouterLink],
    templateUrl: './help.component.html',
    styleUrl: './help.component.scss'
})
export class HelpComponent {}
