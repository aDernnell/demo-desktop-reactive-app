import { Readable } from '@adernnell/simplereactivedom';
export type ToastMessage = string | {
    title: string;
    description?: string;
};
export declare enum ToastType {
    Default = "default",
    Success = "success",
    Info = "info",
    Warning = "warning",
    Error = "error",
    Promise = "promise"
}
export interface ToastController {
    element: HTMLElement;
    /** Make the toast appear by changing its opacity */
    appear: () => Promise<void>;
    /** Make the toast disappear by translating it out to the bottom and then remove it */
    dismiss: () => Promise<void>;
    /** Make the toast disappear by changing its opacity (used when too many toasts are present) */
    overflow: () => Promise<void>;
    /** is the toast currently appearing or already appeared ? */
    isAppearing: () => boolean;
    /** is the toast currently translating out or already dismissed ? */
    isDismissing: () => boolean;
    /** is the toast currently disappearing or already overflowed ? */
    isOverflowing: () => boolean;
}
export interface ToastProps {
    type?: ToastType | Readable<ToastType>;
    msg: ToastMessage | Readable<ToastMessage>;
    appearDuration?: number;
    dismissDuration?: number;
    manualDismissDuration?: number;
    disappearDuration?: number;
    controllerRetriever?: (controller: ToastController) => void;
    onDismissed?: () => void;
}
export declare const Toast: (_props: ToastProps) => HTMLElement;
export interface ToastContainerProps {
    toasts: Readable<Array<ToastController>>;
    gap?: number;
    maxToasts?: number;
    moveUpDuration?: number;
    moveDownDuration?: number;
}
export declare const ToastContainer: (_props: ToastContainerProps) => HTMLElement;
