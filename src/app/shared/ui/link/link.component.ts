import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from '@shared/directives/button.directive';

type ButtonVariant = 'primary' | 'outlined';
type LinkVariant = 'default' | ButtonVariant;

@Component({
    selector: 'ui-link',
    imports: [RouterLink, ButtonDirective],
    templateUrl: './link.component.html',
    styleUrl: './link.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkComponent {
    readonly href = input<string | null>(null);
    readonly route = input<string | (string | number)[] | null>(null);
    readonly variant = input<LinkVariant>('default');

    protected readonly isExternal = computed(() => this.href() !== null);
    protected readonly buttonVariant = computed<ButtonVariant | null>(() =>
        this.variant() === 'default' ? null : (this.variant() as ButtonVariant)
    );
}
