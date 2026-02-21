import React from 'react';

type RevealType = 'fade' | 'parallax';
type ColorScheme = 'dark' | 'teal' | 'lime' | 'slate';

interface ScrollRevealWrapperProps {
    children: React.ReactNode;
    type: RevealType;
    colorScheme: ColorScheme;
    className?: string;
}

export const ScrollRevealWrapper: React.FC<ScrollRevealWrapperProps> = ({
    children,
}) => {
    // Dark mode is enforced site-wide, so render content without light-mode reveal effects.
    return <>{children}</>;
};
