import { Slider } from "@/components/ui/slider";
import { Role, getRoleDescription } from "./roleData";

interface RoleSliderProps {
  role: Role;
  hours: number;
  onChange: (hours: number) => void;
}

const RoleSlider = ({ role, hours, onChange }: RoleSliderProps) => {
  const description = getRoleDescription(role, hours);

  const handleSliderChange = (value: number[]) => {
    onChange(value[0]);
  };

  return (
    <div 
      className={`card-glass p-4 transition-all duration-300 ${
        hours > 0 ? "border-primary/30 bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-foreground">{role.name}</span>
        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
          hours > 0 
            ? "text-primary bg-primary/10" 
            : "text-muted-foreground bg-muted/30"
        }`}>
          {hours} hrs
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground w-8">0</span>
        <Slider
          value={[hours]}
          onValueChange={handleSliderChange}
          max={160}
          step={1}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-8 text-right">160</span>
      </div>

      {description && (
        <div className="mt-3 bg-primary/10 border border-primary/20 rounded-lg p-2">
          <p className="text-sm text-foreground/90">
            <span className="font-medium text-primary">What you get: </span>
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleSlider;
