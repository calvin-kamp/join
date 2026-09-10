import { Routes } from '@angular/router';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';
import { ContactsComponent } from './contacts/contacts.component';

/** Contacts page; `:id` shows a single contact next to the list (`0` = the signed-in user). */
export const CONTACTS_ROUTES: Routes = [
    {
        path: '',
        component: ContactsComponent,
        children: [
            {
                path: ':id',
                component: ContactDetailComponent
            }
        ]
    }
];
