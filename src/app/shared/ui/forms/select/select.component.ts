import { Component, computed, forwardRef, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgSelectComponent, NgOptionTemplateDirective } from '@ng-select/ng-select';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';

/** Option passed to {@link SelectComponent}: an object (read via `bindLabel`/`bindValue`) or a plain string. */
export type SelectOption = object | string;

/** Value the select reports to the form: one value, or an array in multi-select mode. */
type SelectValue = string | number | boolean | object | Array<string | number | boolean | object> | null;

/**
 * Dropdown based on ng-select, as form control.
 *
 * Supports single and multi select, search, avatars and checkboxes per
 * option, and a custom placeholder that can stay visible in multi-select mode.
 */
@Component({
    selector: 'ui-select',
    imports: [NgSelectComponent, NgOptionTemplateDirective, FormsModule, InitialLetterComponent],
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true
        }
    ]
})
export class SelectComponent implements ControlValueAccessor {
    /** Selectable options. */
    options = input<readonly SelectOption[]>([]);

    /** Mutable copy of `options`; ng-select expects a mutable array. */
    protected readonly ngSelectItems = computed(() => [...this.options()]);

    /** Allows several selected values; the form value becomes an array. */
    multiSelect = input<boolean>(false);

    /** Shows a checkbox per option (multi select only). */
    useCheckboxes = input<boolean>(false);

    /** Shows an initials avatar per option. */
    showAvatar = input<boolean>(false);

    /** Option property used for the avatar initials. */
    avatarNameField = input<string>('name');

    /** Option property shown as text. */
    bindLabel = input<string>('label');

    /** Option property used as form value. */
    bindValue = input<string>('value');

    placeholder = input<string>('');

    /** Allows typing to filter the options. */
    searchable = input<boolean>(false);

    /** Shows a button that clears the selection. */
    clearable = input<boolean>(true);

    label = input<string>('');

    /** Shows the required mark. */
    isRequired = input<boolean>(false);

    /** Stretches the control to the full width. */
    fullWidth = input<boolean>(false);

    /** Hides the selected values inside the field (multi select only). */
    hideMultiLabels = input<boolean>(false);

    /** Keeps the placeholder visible although values are selected. */
    alwaysShowPlaceholder = input<boolean>(false);

    /** Closes the dropdown after a pick; defaults to `true` for single and `false` for multi select. */
    closeOnSelect = input<boolean | undefined>(undefined);

    /** `true` while the control has focus; hides the custom placeholder. */
    isFocused = signal<boolean>(false);

    /** Error text below the control; a non-empty text marks it invalid. */
    errorMessage = input<string>('');

    protected readonly hasError = computed(() => this.errorMessage().length > 0);

    /** `closeOnSelect`, or its default for the current mode. */
    readonly effectiveCloseOnSelect = computed(() => {
        const explicit = this.closeOnSelect();
        if (explicit !== undefined) return explicit;
        // Multi-select stays open by default so the user can pick several items
        return !this.multiSelect();
    });

    /** Emits the new value on every user change. */
    changeEvent = output<SelectValue>();

    /** Current value. */
    selectedValue = signal<SelectValue>(null);

    isDisabled = signal<boolean>(false);

    /** `false` for `null`, `''` and empty arrays. */
    readonly hasSelectedValue = computed(() => {
        const v = this.selectedValue();
        if (v === null || v === undefined || v === '') return false;
        if (Array.isArray(v)) return (v as unknown[]).length > 0;
        return true;
    });

    /** Current search text; hides the custom placeholder while typing. */
    searchTerm = signal('');

    private onChange: (value: SelectValue) => void = () => {};
    private onTouched: () => void = () => {};

    /** Marks the control as focused. */
    handleFocused() {
        this.isFocused.set(true);
    }

    /** Called by the forms API to set the value. */
    writeValue(value: SelectValue): void {
        this.selectedValue.set(value);
    }

    /** Called by the forms API to register the change callback. */
    registerOnChange(fn: (value: SelectValue) => void): void {
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

    /** Stores a value picked in ng-select and reports it to the form. */
    handleValueChange(value: SelectValue): void {
        this.selectedValue.set(value);
        this.onChange(value);
        this.changeEvent.emit(value);
    }

    /** Marks the control as touched and unfocused. */
    handleBlur(): void {
        this.onTouched();
        this.isFocused.set(false);
    }
}
