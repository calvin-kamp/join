import { type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';

/**
 * Form-group validator that compares two controls.
 *
 * Returns `{ passwordMismatch: true }` on the group when the values differ.
 *
 * @param passwordKey - Name of the password control.
 * @param confirmKey - Name of the confirm control.
 */
export function passwordMatchValidator(
    passwordKey: string = 'password',
    confirmKey: string = 'confirmPassword'
): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.get(passwordKey)?.value;
        const confirmPassword = control.get(confirmKey)?.value;

        return password === confirmPassword ? null : { passwordMismatch: true };
    };
}
