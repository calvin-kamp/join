import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'ui-dialog',
    imports: [ButtonComponent],
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.scss'
})
export class DialogComponent {
    open = input<boolean>(false);
    close = output<void>();

    dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');

    constructor() {
        effect(() => {
            const $dialog = this.dialogRef().nativeElement;

            if (this.open() && !$dialog.open) {
                $dialog.showModal();
            } else if (!this.open() && $dialog.open) {
                $dialog.close();
            }
        });
    }

    nativeClose(): void {
        this.close.emit();
    }

    closeOnBackdropClick(event: MouseEvent): void {
        const dialogElement = this.dialogRef().nativeElement;

        if (event.target === dialogElement) {
            dialogElement.close();
        }
    }
}
