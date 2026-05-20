import { Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgSelectComponent, NgOptionTemplateDirective } from '@ng-select/ng-select';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';

export type SelectOption = object | string;
type SelectValue = string | number | boolean | object | Array<string | number | boolean | object> | null;

@Component({
    selector: 'ui-select',
    imports: [NgSelectComponent, NgOptionTemplateDirective, FormsModule, InitialLetterComponent],
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true
        }
    ]
})
export class SelectComponent implements ControlValueAccessor {
    options = input<readonly SelectOption[]>([]);
    multiSelect = input<boolean>(false);
    useCheckboxes = input<boolean>(false);
    showAvatar = input<boolean>(false);
    avatarNameField = input<string>('name');
    bindLabel = input<string>('label');
    bindValue = input<string>('value');
    placeholder = input<string>('');
    searchable = input<boolean>(false);
    clearable = input<boolean>(true);
    label = input<string>('');
    isRequired = input<boolean>(false);
    fullWidth = input<boolean>(false);
    hideMultiLabels = input<boolean>(false);
    alwaysShowPlaceholder = input<boolean>(false);
    closeOnSelect = input<boolean | undefined>(undefined);

    readonly effectiveCloseOnSelect = computed(() => {
        const explicit = this.closeOnSelect();
        if (explicit !== undefined) return explicit;
        // Multi-select stays open by default so the user can pick several items
        return !this.multiSelect();
    });

    changeEvent = output<SelectValue>();

    selectedValue = signal<SelectValue>(null);
    isDisabled = signal<boolean>(false);

    readonly hasSelectedValue = computed(() => {
        const v = this.selectedValue();
        if (v === null || v === undefined || v === '') return false;
        if (Array.isArray(v)) return (v as unknown[]).length > 0;
        return true;
    });

    private onChange: (value: SelectValue) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: SelectValue): void {
        this.selectedValue.set(value);
    }

    registerOnChange(fn: (value: SelectValue) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }

    handleValueChange(value: SelectValue): void {
        this.selectedValue.set(value);
        this.onChange(value);
        this.changeEvent.emit(value);
    }

    handleBlur(): void {
        this.onTouched();
    }
}
