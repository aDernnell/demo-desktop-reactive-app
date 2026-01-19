import { html, node } from '@adernnell/simplereactivedom';

export interface IconProps {
    width?: number;
    height?: number;
}

export const DeleteIcon = (props: IconProps = {}) => {
    const { width = 16, height = 16 } = props;
    return node(html`
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="${width}"
            height="${height}"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    `);
};

// https://lucide.dev/license
export const ClearIcon = (props: IconProps = {}) => {
    const { width = 16, height = 16 } = props;
    return node(html`
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="${width}"
            height="${height}"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M18 5H3" />
            <path d="M18 12H3" />
            <path d="M11 19H3" />
            <path d="m15.5 16.5 5 5" />
            <path d="m20.5 16.5-5 5" />
        </svg>
    `);
};

// https://lucide.dev/license
export const ResetFiltersIcon = (props: IconProps = {}) => {
    const { width = 16, height = 16 } = props;
    return node(html`
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="${width}"
            height="${height}"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path
                d="M12.531 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l.427-.473"
            />
            <path d="m16.5 3.5 5 5" />
            <path d="m21.5 3.5-5 5" />
        </svg>
    `);
};

export const ReloadIcon = (props: IconProps = {}) => {
    const { width = 16, height = 16 } = props;
    return node(html`
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="${width}"
            height="${height}"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path
                d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z"
            />
        </svg>
    `);
};

export const CloseIcon = (props: IconProps = {}) => {
    const { width = 16, height = 16 } = props;
    return node(html`
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="${width}"
            height="${height}"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    `);
};

export const LoadingIcon = (props: IconProps = {}) => {
    const { width = 16, height = 16 } = props;
    return node(html`
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="${width}"
            height="${height}"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <style>
                g {
                    animation: rotate 2s linear infinite;
                    transform-origin: center center;
                }
                circle {
                    stroke-dasharray: 75, 100;
                    stroke-dashoffset: -5;
                    animation: dash 1.5s ease-in-out infinite;
                }
                @keyframes rotate {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                @keyframes dash {
                    0% {
                        stroke-dasharray: 1, 100;
                        stroke-dashoffset: 0;
                    }
                    50% {
                        stroke-dasharray: 44.5, 100;
                        stroke-dashoffset: -17.5;
                    }
                    100% {
                        stroke-dasharray: 44.5, 100;
                        stroke-dashoffset: -62;
                    }
                }
            </style>
            <g>
                <circle cx="12" cy="12" r="10" />
            </g>
        </svg>
    `);
};
