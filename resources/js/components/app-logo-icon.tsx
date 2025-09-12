import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 3V21H21V19H19V17H17V15H15V13H13V11H11V9H9V7H7V5H5V3H3ZM5 5V7H7V9H9V11H11V13H13V15H15V17H17V19H19V21H5V5Z"
            />
            <path d="M7 17H9V15H11V13H13V11H15V9H17V7H19V9H17V11H15V13H13V15H11V17H9V19H7V17Z" />
            <circle cx="8" cy="16" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="16" cy="8" r="1" />
        </svg>
    );
}
