import { ToastMessage } from '../..';
export interface IToasterService {
    initToastContainer: (container: HTMLElement) => void;
    showMessage: (msg: ToastMessage, duration?: number) => void;
    showSuccess: (msg: ToastMessage, duration?: number) => void;
    showInfo: (msg: ToastMessage, duration?: number) => void;
    showWarning: (msg: ToastMessage, duration?: number) => void;
    showError: (msg: ToastMessage, duration?: number) => void;
    showPromise: (promise: Promise<any>, msgs: {
        loading: ToastMessage;
        success: ToastMessage;
        error: ((e: unknown) => ToastMessage) | ToastMessage;
    }, duration?: number) => void;
    clearAll: () => void;
}
export declare const toastService: IToasterService;
