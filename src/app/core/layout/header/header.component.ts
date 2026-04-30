import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { LinkComponent } from '@shared/ui/link/link.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
    selector: 'layout-header',
    imports: [LogoComponent, LinkComponent, IconComponent],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
    isToggled = false;
    showMenu() {
        this.isToggled = !this.isToggled;
        console.log(this.isToggled);
    }
}
