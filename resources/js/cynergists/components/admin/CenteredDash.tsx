/**
 * CenteredDash - A centered em dash for empty table cells
 */
export const CenteredDash = () => (
    <span className="flex w-full justify-center text-muted-foreground">—</span>
);

/**
 * Helper function to return value or centered dash
 */
export const valueOrDash = (
    value: string | null | undefined,
): React.ReactNode => {
    if (!value) return <CenteredDash />;
    return value;
};
