import { ChangeDetectionStrategy, Component, computed, forwardRef, input, linkedSignal, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Checkbox with label, required mark and error message.
 *
 * Works with reactive forms (`formControlName`) or standalone via the `value`
 * input and the `changed` output. The label is the projected content.
 */
@Component({
    selector: 'ui-checkbox',
    imports: [],
    templateUrl: './checkbox.component.html',
    styleUrl: './checkbox.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxComponent),
            multi: true
        }
    ]
})
export class CheckboxComponent implements ControlValueAccessor {
    /** Name attribute; also used to build the element id. */
    name = input<string>('');

    /** Error text below the checkbox; a non-empty text marks it invalid. */
    errorMessage = input<string>('');

    /** Sets `aria-required` and shows the required mark. */
    isRequired = input<boolean>(false);

    /** Hides the `*` although `isRequired` is set. */
    hideRequiredMark = input<boolean>(false);

    /** `false` keeps the label for screen readers only. */
    labelVisible = input<boolean>(true);

    /** Stretches the control to the full width. */
    fullWidth = input<boolean>(false);

    /** Checked state when used without a form control. */
    value = input<boolean>(false);

    /** Emits the new checked state on every user change. */
    changed = output<boolean>();

    /** Current checked state; follows `value` and is overwritten by user input and `writeValue`. */
    protected readonly checked = linkedSignal(() => this.value());
    protected readonly isDisabled = signal(false);

    protected readonly inputId = computed(() => `ui-checkbox-${this.name()}`);
    protected readonly hasError = computed(() => this.errorMessage().length > 0);

    private onChange = (_: boolean) => {};
    private onTouched = () => {};

    /** Called by the forms API to set the checked state. */
    writeValue(value: boolean): void {
        this.checked.set(!!value);
    }

    /** Called by the forms API to register the change callback. */
    registerOnChange(fn: (value: boolean) => void): void {
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

    protected onCheckedChange(event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;

        this.checked.set(checked);
        this.onChange(checked);
        this.changed.emit(checked);
    }

    protected onBlur(): void {
        this.onTouched();
    }
}
