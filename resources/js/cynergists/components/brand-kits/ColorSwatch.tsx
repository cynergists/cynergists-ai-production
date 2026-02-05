interface ColorSwatchProps {
    color: string;
    name?: string;
}

const ColorSwatch = ({ color, name }: ColorSwatchProps) => {
    return (
        <div className="flex flex-col items-center">
            <div
                className="h-20 w-20 rounded-lg border border-border/20 shadow-lg md:h-24 md:w-24"
                style={{ backgroundColor: color }}
            />
            <span className="mt-2 font-mono text-sm text-muted-foreground uppercase">
                {color}
            </span>
            {name && (
                <span className="text-xs text-muted-foreground">{name}</span>
            )}
        </div>
    );
};

export default ColorSwatch;
