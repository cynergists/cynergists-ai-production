interface TypographyDisplayProps {
    fontName: string;
    fontFamily?: string;
    isSecondary?: boolean;
}

const TypographyDisplay = ({
    fontName,
    fontFamily,
    isSecondary = false,
}: TypographyDisplayProps) => {
    const displayStyle = fontFamily ? { fontFamily } : {};

    return (
        <div className="card-glass p-6 lg:p-8">
            <div className="mb-2 text-sm text-muted-foreground">
                {isSecondary ? 'Secondary Typeface' : 'Primary Typeface'}
            </div>
            <h3
                className="mb-6 text-3xl font-bold text-foreground md:text-4xl"
                style={displayStyle}
            >
                {fontName}
            </h3>
            <div className="space-y-3" style={displayStyle}>
                <p className="text-2xl tracking-wide text-foreground md:text-3xl">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                </p>
                <p className="text-xl tracking-wide text-foreground/80 md:text-2xl">
                    abcdefghijklmnopqrstuvwxyz
                </p>
                <p className="text-lg tracking-wide text-muted-foreground md:text-xl">
                    0123456789
                </p>
            </div>
        </div>
    );
};

export default TypographyDisplay;
