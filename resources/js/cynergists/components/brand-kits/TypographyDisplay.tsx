interface TypographyDisplayProps {
  fontName: string;
  fontFamily?: string;
  isSecondary?: boolean;
}

const TypographyDisplay = ({ fontName, fontFamily, isSecondary = false }: TypographyDisplayProps) => {
  const displayStyle = fontFamily ? { fontFamily } : {};
  
  return (
    <div className="card-glass p-6 lg:p-8">
      <div className="text-sm text-muted-foreground mb-2">
        {isSecondary ? "Secondary Typeface" : "Primary Typeface"}
      </div>
      <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6" style={displayStyle}>
        {fontName}
      </h3>
      <div className="space-y-3" style={displayStyle}>
        <p className="text-2xl md:text-3xl tracking-wide text-foreground">
          ABCDEFGHIJKLMNOPQRSTUVWXYZ
        </p>
        <p className="text-xl md:text-2xl tracking-wide text-foreground/80">
          abcdefghijklmnopqrstuvwxyz
        </p>
        <p className="text-lg md:text-xl tracking-wide text-muted-foreground">
          0123456789
        </p>
      </div>
    </div>
  );
};

export default TypographyDisplay;
