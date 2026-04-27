import { type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';

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
