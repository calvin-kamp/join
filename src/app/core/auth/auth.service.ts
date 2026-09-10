import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '@core/supabase/supabase.service';
import { Contact } from '@features/contacts/contacts.service';
import {
    AuthApiError,
    type Session,
    type User,
    type AuthError,
    type AuthTokenResponsePassword
} from '@supabase/supabase-js';

/**
 * Holds the current Supabase session and wraps all auth operations.
 *
 * The session is kept in a signal, so every derived value (`user`,
 * `isLoggedIn`, `displayName`) updates automatically on sign in and sign out.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
    private supabase = inject(SupabaseService).client;
    private router = inject(Router);

    private session = signal<Session | null>(null);

    /** The signed-in user, or `null` without a session. */
    readonly user = computed<User | null>(() => this.session()?.user ?? null);

    /** `true` while a session exists. */
    readonly isLoggedIn = computed<boolean>(() => this.session() !== null);

    private readonly ready: Promise<void>;

    /**
     * Name shown in the UI.
     *
     * `'Guest'` without a session, otherwise the `name` from the user metadata.
     */
    readonly displayName = computed<string>(() => {
        const user = this.user();

        if (!user) {
            return 'Guest';
        }

        const metaName = user.user_metadata?.['name'];

        if (metaName) {
            return metaName;
        }
    });

    constructor() {
        this.ready = this.supabase.auth.getSession().then(({ data }) => {
            this.session.set(data.session);
        });
        this.supabase.auth.onAuthStateChange((_event, session) => this.session.set(session));
    }

    /**
     * Resolves once the stored session has been read.
     *
     * Guards await this before they check {@link isLoggedIn}; without it, a
     * page reload would briefly look like "not logged in".
     */
    whenReady(): Promise<void> {
        return this.ready;
    }

    /**
     * Signs in with email and password.
     *
     * The returned promise resolves after the session signal has been updated.
     *
     * @returns The Supabase response; check its `error` field.
     */
    signIn(email: string, password: string): Promise<AuthTokenResponsePassword> {
        return this.supabase.auth.signInWithPassword({ email, password });
    }

    /**
     * Creates a new account and stores `name` in the user metadata.
     *
     * @throws {AuthApiError} With code `user_already_exists` if the email is
     * already registered (Supabase reports this as a user without identities).
     * @throws {AuthError} For every other failed sign up.
     */
    async signUp(email: string, password: string, name: string): Promise<void> {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
        });

        if (error) {
            throw error;
        }

        if (data.user && data.user.identities?.length === 0) {
            throw new AuthApiError('User already registered', 422, 'user_already_exists');
        }
    }

    /**
     * Ends the session and navigates to the sign-in page.
     *
     * @returns The Supabase response; check its `error` field.
     */
    async signOut(): Promise<{ error: AuthError | null }> {
        const result = await this.supabase.auth.signOut();

        await this.router.navigateByUrl('/auth/sign-in');

        return result;
    }

    /**
     * Builds a contact object from the signed-in user.
     *
     * Returns a guest contact with empty mail and phone without a session.
     */
    getUserContact(): Contact {
        const user = this.user();

        let contact: Contact;

        if (!user) {
            contact = {
                name: 'Guest',
                mail: '',
                phone: ''
            };
            return contact;
        }
        contact = {
            name: this.displayName(),
            mail: String(user.email),
            phone: String(user.user_metadata['phone'])
        };

        return contact;
    }

    /**
     * Saves name, email and phone of the signed-in user.
     *
     * @throws {Error} Without a session.
     * @throws {AuthError} If Supabase rejects the update.
     */
    async updateUserContact(payload: Contact): Promise<void> {
        const user = this.user();

        if (!user) {
            throw new Error('No user logged in');
        }

        const { error } = await this.supabase.auth.updateUser({
            email: payload.mail,
            data: { name: payload.name, phone: payload.phone }
        });

        if (error) {
            throw error;
        }
    }
}
