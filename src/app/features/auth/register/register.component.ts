import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isAuthApiError } from '@supabase/supabase-js';
import { AuthService } from '@core/auth/auth.service';
import { CardDirective } from '@shared/directives/card.directive';
import { controlErrorMessage } from '@shared/forms/control-error-message';
import { passwordMatchValidator } from '@shared/forms/password-match.validator';
import { ToastService } from '@shared/services/toast.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/forms/input/input.component';
import { CheckboxComponent } from '@shared/ui/forms/checkbox/checkbox.component';
import { LinkComponent } from '@shared/ui/link/link.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

/** User-facing texts for the Supabase auth error codes that can occur on sign up. */
const SIGN_UP_ERRORS: Record<string, string> = {
    user_already_exists: 'This email address is already registered.',
    email_exists: 'This email address is already registered.',
    email_address_invalid: 'Please enter a valid email address.',
    weak_password: 'Please choose a stronger password.',
    over_email_send_rate_limit: 'Too many attempts. Please try again in a few minutes.',
    signup_disabled: 'Sign up is currently unavailable.'
};

const SIGN_UP_FALLBACK = 'Sign up failed. Please try again.';

/**
 * Maps a caught sign-up error to a user-facing text.
 *
 * @param caught - Anything thrown by `AuthService.signUp`.
 * @returns The mapped text, or a generic fallback for unknown errors.
 */
function signUpErrorMessage(caught: unknown): string {
    if (isAuthApiError(caught) && caught.code) {
        return SIGN_UP_ERRORS[caught.code] ?? SIGN_UP_FALLBACK;
    }

    return SIGN_UP_FALLBACK;
}

/**
 * Sign-up form.
 *
 * Validates name, email, matching passwords and the privacy-policy checkbox,
 * then creates the account and navigates to `/summary`.
 */
@Component({
    selector: 'auth-register',
    imports: [
        CardDirective,
        InputComponent,
        ReactiveFormsModule,
        ButtonComponent,
        CheckboxComponent,
        LinkComponent,
        IconComponent
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    /** `true` while the sign-up request is running. */
    loading = signal<boolean>(false);

    /** Error text of the last failed sign up, `null` otherwise. */
    error = signal<string | null>(null);

    toast = inject(ToastService);

    /** Sign-up form model; the group validator checks that both passwords match. */
    registerForm = this.fb.group(
        {
            name: ['', [Validators.required, Validators.minLength(4)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            acceptTos: [false, Validators.requiredTrue]
        },
        { validators: passwordMatchValidator() }
    );

    protected nameError = controlErrorMessage(this.registerForm.controls.name, {
        required: 'Name is required',
        minlength: 'Must be at least 4 characters'
    });

    protected emailError = controlErrorMessage(this.registerForm.controls.email, {
        required: 'Email is required',
        email: 'Please enter a valid email address'
    });

    protected passwordError = controlErrorMessage(this.registerForm.controls.password, {
        required: 'Password is required',
        minlength: 'Must be at least 6 characters'
    });

    private confirmFieldError = controlErrorMessage(this.registerForm.controls.confirmPassword, {
        required: 'Please confirm your password'
    });

    protected acceptTosError = controlErrorMessage(this.registerForm.controls.acceptTos, {
        required: 'Please accept the Privacy Policy'
    });

    private formStatus = toSignal(this.registerForm.statusChanges, {
        initialValue: this.registerForm.status
    });

    /**
     * Error text for the confirm field.
     *
     * Shows the field's own error first, then the form-level mismatch error.
     * Reads `formStatus` so it re-runs when the form-level validator changes.
     */
    protected passwordConfirmError = computed(() => {
        const fieldErr = this.confirmFieldError();

        if (fieldErr) {
            return fieldErr;
        }

        this.formStatus();

        if (this.registerForm.controls.confirmPassword.touched && this.registerForm.errors?.['passwordMismatch']) {
            return 'Passwords do not match';
        }

        return '';
    });

    /**
     * Validates the form and creates the account.
     *
     * Invalid fields are marked and show their error message instead.
     */
    async onSubmit(): Promise<void> {
        this.registerForm.markAllAsTouched();

        if (this.registerForm.invalid) {
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        try {
            const { name, email, password } = this.registerForm.getRawValue();
            await this.auth.signUp(email!, password!, name!);
            this.toast.show('You Signed Up successfully');
            await this.router.navigateByUrl('/summary');
        } catch (caught) {
            this.error.set(signUpErrorMessage(caught));
        } finally {
            this.loading.set(false);
        }
    }
}
