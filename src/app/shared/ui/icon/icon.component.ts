import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';

/** Names of all icons in the sprite template. */
export type IconName =
    | 'more-vertical'
    | 'arrow-left'
    | 'help-question'
    | 'nav-summary'
    | 'nav-board'
    | 'nav-add-task'
    | 'nav-contacts'
    | 'nav-login'
    | 'add-contact'
    | 'close'
    | 'plus'
    | 'chevron-down'
    | 'chevron-up'
    | 'mail'
    | 'lock'
    | 'password-visible'
    | 'person'
    | 'password-hidden'
    | 'pen-solid'
    | 'pen-outline'
    | 'check-solid'
    | 'check-outline'
    | 'calender'
    | 'trash'
    | 'badge-urgent'
    | 'badge-medium'
    | 'badge-low'
    | 'search'
    | 'board-add-task'
    | 'phone';

/** Size in px, either fixed or per breakpoint. */
type ResponsiveSize = number | { base?: number; md?: number; lg?: number };

/** Native size of an icon. */
interface IconMeta {
    viewBox: string;
    width: number;
    height: number;
}

/** Native size and view box of every icon. */
const ICONS: Record<IconName, IconMeta> = {
    'more-vertical': {
        viewBox: '0 0 6 22',
        width: 6,
        height: 22
    },
    'arrow-left': {
        viewBox: '0 0 32 32',
        width: 32,
        height: 32
    },
    'help-question': {
        viewBox: '0 0 20 20',
        width: 20,
        height: 20
    },
    'nav-summary': {
        viewBox: '0 0 20 20',
        width: 20,
        height: 20
    },
    'nav-board': {
        viewBox: '0 0 24 21',
        width: 24,
        height: 21
    },
    'nav-add-task': {
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
    },
    'nav-contacts': {
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
    },
    'nav-login': {
        viewBox: '0 0 22 22',
        width: 22,
        height: 22
    },
    'add-contact': {
        viewBox: '0 0 32 32',
        width: 32,
        height: 32
    },
    close: {
        viewBox: '0 0 13 13',
        width: 13,
        height: 13
    },
    plus: {
        viewBox: '0 0 17 17',
        width: 17,
        height: 17
    },
    'chevron-down': {
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
    },
    'chevron-up': {
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
    },
    mail: {
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
    },
    lock: {
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
    },
    'password-visible': {
        viewBox: '0 0 22 15',
        width: 22,
        height: 15
    },
    person: {
        viewBox: '0 0 16 16',
        width: 16,
        height: 16
    },
    'password-hidden': {
        viewBox: '0 0 22 19',
        width: 22,
        height: 19
    },
    'pen-solid': {
        viewBox: '0 0 17 24',
        width: 17,
        height: 24
    },
    'pen-outline': {
        viewBox: '0 0 19 19',
        width: 19,
        height: 19
    },
    'check-solid': {
        viewBox: '0 0 15 11',
        width: 15,
        height: 11
    },
    'check-outline': {
        viewBox: '0 0 21 16',
        width: 21,
        height: 16
    },
    calender: {
        viewBox: '0 0 18 20',
        width: 18,
        height: 20
    },
    trash: {
        viewBox: '0 0 16 18',
        width: 16,
        height: 18
    },
    'badge-urgent': {
        viewBox: '0 0 20 15',
        width: 20,
        height: 15
    },
    'badge-medium': {
        viewBox: '0 0 20 8',
        width: 20,
        height: 8
    },
    'badge-low': {
        viewBox: '0 0 20 15',
        width: 20,
        height: 15
    },
    search: {
        viewBox: '0 0 18 18',
        width: 18,
        height: 18
    },
    'board-add-task': {
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
    },
    phone: {
        viewBox: '0 0 18 18',
        width: 18,
        height: 18
    }
};

/**
 * Inline SVG icon.
 *
 * Without `width`/`height` the icon renders in its native size. Sizes per
 * breakpoint are passed to CSS as custom properties.
 */
@Component({
    selector: 'ui-icon',
    imports: [],
    templateUrl: './icon.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './icon.component.scss'
})
export class IconComponent {
    /** Icon to render. */
    name = input.required<IconName>();

    /** Width in px, fixed or per breakpoint. */
    width = input<ResponsiveSize>();

    /** Height in px, fixed or per breakpoint. */
    height = input<ResponsiveSize>();

    protected readonly viewBox = computed(() => ICONS[this.name()].viewBox);

    /** Width and height per breakpoint as CSS values; `null` where no size is set. */
    protected readonly sizeVars = computed(() => {
        const meta = ICONS[this.name()];
        const width = this.resolve(this.width(), meta.width);
        const height = this.resolve(this.height(), meta.height);

        return {
            wBase: `${width.base}px`,
            hBase: `${height.base}px`,
            wMd: width.md !== null ? `${width.md}px` : null,
            hMd: height.md !== null ? `${height.md}px` : null,
            wLg: width.lg !== null ? `${width.lg}px` : null,
            hLg: height.lg !== null ? `${height.lg}px` : null
        };
    });

    /** Normalizes a size input to base/md/lg values, using `fallback` as base. */
    private resolve(
        size: ResponsiveSize | undefined,
        fallback: number
    ): { base: number; md: number | null; lg: number | null } {
        if (size === undefined) {
            return { base: fallback, md: null, lg: null };
        }

        if (typeof size === 'number') {
            return { base: size, md: null, lg: null };
        }

        return {
            base: size.base ?? fallback,
            md: size.md ?? null,
            lg: size.lg ?? null
        };
    }
}
