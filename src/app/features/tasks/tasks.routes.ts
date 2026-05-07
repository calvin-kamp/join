import { Routes } from '@angular/router';
import { guestGuard } from '@core/auth/auth.guard';

export const TASKS_ROUTES: Routes = [
    {
        path: 'board',
        pathMatch: 'full',
        canActivate: [guestGuard],
        loadComponent: () => import('./board/board.component').then((m) => m.BoardComponent)
    },
    {
        path: 'add-task',
        loadComponent: () => import('./add-task/add-task.component').then((m) => m.AddTaskComponent)
    }
];
