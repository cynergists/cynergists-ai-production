import cynergistsLogo from '@/cynergists/assets/logos/cynergists-ai-full.webp';
import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img {...props} src={cynergistsLogo} alt="Cynergists AI" />
    );
}
