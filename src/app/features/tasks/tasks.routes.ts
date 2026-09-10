import { Routes } from '@angular/router';
import { guestGuard } from '@core/auth/auth.guard';

/** Board and add-task page. */
export const TASKS_ROUTES: Routes = [
    {
        path: 'board',
        pathMatch: 'full',
        loadComponent: () => import('./board/board.component').then((m) => m.BoardComponent)
    },
    {
        path: 'add-task',
        loadComponent: () => import('./add-task/add-task.component').then((m) => m.AddTaskComponent)
    }
];
