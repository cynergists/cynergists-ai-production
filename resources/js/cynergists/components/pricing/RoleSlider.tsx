import { Slider } from '@/components/ui/slider';
import { Role, getRoleDescription } from './roleData';

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
                hours > 0 ? 'border-primary/30 bg-primary/5' : ''
            }`}
        >
            <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-foreground">{role.name}</span>
                <span
                    className={`rounded-full px-2 py-0.5 text-sm font-semibold ${
                        hours > 0
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/30 text-muted-foreground'
                    }`}
                >
                    {hours} hrs
                </span>
            </div>

            <div className="flex items-center gap-4">
                <span className="w-8 text-xs text-muted-foreground">0</span>
                <Slider
                    value={[hours]}
                    onValueChange={handleSliderChange}
                    max={160}
                    step={1}
                    className="flex-1"
                />
                <span className="w-8 text-right text-xs text-muted-foreground">
                    160
                </span>
            </div>

            {description && (
                <div className="mt-3 rounded-lg border border-primary/20 bg-primary/10 p-2">
                    <p className="text-sm text-foreground/90">
                        <span className="font-medium text-primary">
                            What you get:{' '}
                        </span>
                        {description}
                    </p>
                </div>
            )}
        </div>
    );
};

export default RoleSlider;
