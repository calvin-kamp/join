import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { CardDirective } from '@shared/directives/card.directive';
import { controlErrorMessage } from '@shared/forms/control-error-message';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/forms/input/input.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

/** Credentials of the shared guest account. */
const GUEST_CREDENTIALS = {
    email: 'guest@guest.test',
    password: 'guest@guest.test'
} as const;

/**
 * Login form with email/password and a guest login.
 *
 * After a successful login it navigates to `/summary`.
 */
@Component({
    selector: 'auth-login',
    imports: [ReactiveFormsModule, CardDirective, InputComponent, ButtonComponent, IconComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    /** `true` while a login request is running; disables both buttons. */
    loading = signal<boolean>(false);

    /** Error text of the last failed login, `null` otherwise. */
    error = signal<string | null>(null);

    /** Shows the password as plain text when `true`. */
    showPassword = signal<boolean>(false);

    /** Login form model. */
    logInForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    protected emailError = controlErrorMessage(this.logInForm.controls.email, {
        required: 'Email is required',
        email: 'Please enter a valid email address'
    });

    protected passwordError = controlErrorMessage(this.logInForm.controls.password, {
        required: 'Password is required',
        minlength: 'Must be at least 6 characters'
    });

    /**
     * Validates the form and logs in with the entered credentials.
     *
     * Invalid fields are marked and show their error message instead.
     */
    async onSubmit(): Promise<void> {
        this.logInForm.markAllAsTouched();

        if (this.logInForm.invalid) {
            return;
        }

        const { email, password } = this.logInForm.getRawValue();

        await this.signInAndRedirect(email!, password!);
    }

    /** Logs in with the shared guest account. */
    async continueAsGuest(): Promise<void> {
        await this.signInAndRedirect(GUEST_CREDENTIALS.email, GUEST_CREDENTIALS.password);
    }

    /** Switches the password field between hidden and visible. */
    togglePassword(): void {
        this.showPassword.set(!this.showPassword());
    }

    /**
     * Signs in and navigates to `/summary` once the session exists.
     *
     * The navigation waits for the sign in: the summary route is protected by
     * `authGuard`, which rejects the navigation while no session exists yet.
     */
    private async signInAndRedirect(email: string, password: string): Promise<void> {
        this.loading.set(true);
        this.error.set(null);

        try {
            const { error } = await this.auth.signIn(email, password);

            if (error) {
                throw error;
            }

            await this.router.navigateByUrl('/summary');
        } catch {
            this.error.set('Login failed.');
        } finally {
            this.loading.set(false);
        }
    }
}
