import { ChangeDetectionStrategy, Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

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
    name = input.required<string>();
    value = input.required<string>();
    checked = input<boolean>(false);
    fillColor = input();

    // Emits this radio's value when the user picks it. Use this instead of
    // formControlName when several ui-radios share one form control — Angular
    // only links one ValueAccessor per FormControl, so radio groups need
    // manual wiring through this output + the [checked] input.
    selectionChange = output<string>();

    protected readonly isDisabled = signal(false);

    protected readonly radioId = computed(() => {
        const safeName = this.name().toLowerCase().replace(/\s+/g, '-');
        const safeValue = this.value().toLowerCase().replace(/\s+/g, '-');

        return `ui-radio-${safeName}-${safeValue}`;
    });

    private onChange = (_: string) => {};
    private onTouched = () => {};

    writeValue(): void {}

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }

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
