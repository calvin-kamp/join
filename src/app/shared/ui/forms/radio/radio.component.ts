import { ChangeDetectionStrategy, Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Single radio button; the label is the projected content.
 */
@Component({
    selector: 'ui-radio',
    imports: [],
    templateUrl: './radio.component.html',
    styleUrl: './radio.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadioComponent),
            multi: true
        }
    ]
})
export class RadioComponent {
    /** Group name; radios with the same name exclude each other. */
    name = input.required<string>();

    /** Value this radio stands for. */
    value = input.required<string>();

    /** Checked state; set by the parent. */
    checked = input<boolean>(false);

    /** CSS color of the checked state. */
    fillColor = input();

    /**
     * Emits this radio's value when the user picks it.
     *
     * Use this instead of `formControlName` when several radios share one
     * form control: a form control links to only one value accessor, so a
     * group is wired through this output plus the `checked` input.
     */
    selectionChange = output<string>();

    protected readonly isDisabled = signal(false);

    /** Element id built from name and value. */
    protected readonly radioId = computed(() => {
        const safeName = this.name().toLowerCase().replace(/\s+/g, '-');
        const safeValue = this.value().toLowerCase().replace(/\s+/g, '-');

        return `ui-radio-${safeName}-${safeValue}`;
    });

    private onChange = (_: string) => {};
    private onTouched = () => {};

    /** No-op; the checked state comes from the `checked` input. */
    writeValue(): void {}

    /** Called by the forms API to register the change callback. */
    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    /** Called by the forms API to register the touched callback. */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** Called by the forms API when the control is enabled or disabled. */
    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }

    /** Reports this radio's value when it becomes checked. */
    protected onChangeInput(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (!input.checked) {
            return;
        }

        this.onChange(this.value());
        this.selectionChange.emit(this.value());
    }

    protected onBlur(): void {
        this.onTouched();
    }
}
