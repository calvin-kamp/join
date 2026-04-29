import { Component, computed, input } from '@angular/core';

export type InitialLetterSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
    selector: 'ui-initial-letter',
    imports: [],
    templateUrl: './initial-letter.component.html',
    styleUrl: './initial-letter.component.scss'
})
export class InitialLetterComponent {
    readonly name = input.required<string>();
    readonly size = input<InitialLetterSize>('md');

    readonly initials = computed(() => {
        const parts = this.name().trim().split(/\s+/).filter(Boolean);

        if (parts.length === 0) {
            return '';
        }

        const first = parts[0][0];
        const last = parts.length > 1 ? parts[parts.length - 1][0] : '';

        return (first + last).toUpperCase();
    });

    readonly backgroundColor = computed(() => {
        const palette = [
            '#FF7A00',
            '#9327FF',
            '#FF745E',
            '#FFC701',
            '#FFE62B',
            '#FF5EB3',
            '#00BEE8',
            '#FFA35E',
            '#0038FF',
            '#FF4646',
            '#6E52FF',
            '#1FD7C1',
            '#FC71FF',
            '#C3FF2B',
            '#FFBB2B'
        ];

        const name = this.name();
        let hash = 0;

        for (const char of name) {
            hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
        }

        return palette[(hash >>> 0) % palette.length];
    });
}
