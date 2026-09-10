import { Component, ElementRef, effect, input, output, viewChild, ChangeDetectionStrategy } from '@angular/core';

/**
 * Modal wrapper around the native `<dialog>` element.
 *
 * `open` controls the dialog; Escape and a click on the backdrop close it and
 * emit `close`, so the parent can reset its `open` state.
 */
@Component({
    selector: 'ui-dialog',
    imports: [],
    templateUrl: './dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './dialog.component.scss'
})
export class DialogComponent {
    /** Shows the dialog modally when `true`. */
    open = input<boolean>(false);

    /** DOM id of the `<dialog>`; dialog-specific styles use it. */
    id = input.required<string>();

    /** Emits whenever the native dialog closes. */
    close = output<void>();

    dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');

    /** Keeps the native dialog in sync with the `open` input. */
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

    /** Forwards the native `close` event. */
    nativeClose(): void {
        this.close.emit();
    }

    /** Closes the dialog when the click hit the backdrop, not the content. */
    closeOnBackdropClick(event: MouseEvent): void {
        const dialogElement = this.dialogRef().nativeElement;

        if (event.target === dialogElement) {
            dialogElement.close();
        }
    }
}
