import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RouteStateService } from '@shared/services/route-state.service';

/**
 * Page frame with header, main area and footer navigation.
 *
 * The main area stops page scrolling on routes listed in
 * `RouteStateService.lockedRoutes`.
 */
@Component({
    selector: 'main-layout',
    imports: [RouterOutlet, HeaderComponent, FooterComponent],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
    protected routeStateService = inject(RouteStateService);
}
