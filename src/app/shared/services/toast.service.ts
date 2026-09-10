import { Injectable } from '@angular/core';
import Toastify from 'toastify-js';

/** Shows short notifications at the bottom of the screen. */
@Injectable({
    providedIn: 'root'
})
export class ToastService {
    /**
     * Shows a notification for 2 seconds.
     *
     * @param msg - Text to show.
     * @param iconPath - Optional path to an icon shown next to the text.
     */
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
