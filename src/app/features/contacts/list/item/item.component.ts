import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'list-item',
    imports: [RouterLink],
    templateUrl: './item.component.html',
    styleUrl: './item.component.scss'
})
export class ItemComponent {
    name = input();
    mail = input();

    getInitials(fullName: unknown): string {
        if (typeof fullName !== 'string') return '';

        return fullName
            .trim()
            .split(' ')
            .filter((part) => part.length > 0)
            .map((part) => part[0].toUpperCase())
            .slice(0, 2)
            .join('');
    }

    getColor(name: unknown): string {
        if (typeof name !== 'string') return '#999';

        let hash = 0;

        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        const colors = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D', '#9D4EDD', '#FF8E3C', '#00C2A8', '#F72585'];

        return colors[Math.abs(hash) % colors.length];
    }
}
