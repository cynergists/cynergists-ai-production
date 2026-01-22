export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <span className="text-xs font-semibold">AI</span>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Cynergists AI
                </span>
            </div>
        </>
    );
}
