import { Injectable } from '@angular/core';
import Toastify from 'toastify-js';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    show(msg: string, iconPath: string | null = null) {
        if (!iconPath) {
            Toastify({
                text: msg,
                duration: 2000,
                gravity: 'bottom', // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                offset: {
                    x: 0,
                    y: 100
                }
            }).showToast();
        } else {
            Toastify({
                text: msg,
                duration: 2000,
                gravity: 'bottom', // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                avatar: iconPath,
                offset: {
                    x: 0,
                    y: 100
                }
            }).showToast();
        }
    }
}
