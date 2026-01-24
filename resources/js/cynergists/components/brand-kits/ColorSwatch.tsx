interface ColorSwatchProps {
  color: string;
  name?: string;
}

const ColorSwatch = ({ color, name }: ColorSwatchProps) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-20 h-20 md:w-24 md:h-24 rounded-lg shadow-lg border border-border/20"
        style={{ backgroundColor: color }}
      />
      <span className="mt-2 text-sm font-mono text-muted-foreground uppercase">{color}</span>
      {name && <span className="text-xs text-muted-foreground">{name}</span>}
    </div>
  );
};

export default ColorSwatch;
