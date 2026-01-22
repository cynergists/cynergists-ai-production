import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <rect
                x="3"
                y="3"
                width="34"
                height="34"
                rx="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <text
                x="20"
                y="24"
                textAnchor="middle"
                fontSize="14"
                fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
                fontWeight="700"
                fill="currentColor"
            >
                AI
            </text>
        </svg>
    );
}
