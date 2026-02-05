import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { buttonVariants } from './button';

interface OrbitingButtonProps
    extends
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const OrbitingButton = React.forwardRef<HTMLButtonElement, OrbitingButtonProps>(
    (
        { className, variant, size, asChild = false, children, ...props },
        ref,
    ) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                className={cn(
                    buttonVariants({ variant, size }),
                    'orbiting-button',
                    className,
                )}
                ref={ref}
                {...props}
            >
                {children}
            </Comp>
        );
    },
);
OrbitingButton.displayName = 'OrbitingButton';

export { OrbitingButton };
