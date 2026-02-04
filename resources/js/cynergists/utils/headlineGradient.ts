// Buzz PHRASES that should get gradient styling in calendar headlines
// These are meaningful phrase segments that make sense together
const BUZZ_PHRASES = [
    // Full phrase patterns (longest first for priority matching)
    'Get Unstuck Fast',
    'Get Clarity and a Real Plan',
    "You're the Right Fit",
    'the Right Fit',
    'Light the Signal',
    'Guest Recording',
    'Scaling Up Success',
    'Pre Show',
    'Almost On',
    // Shorter meaningful phrases
    'Get Clarity',
    'Get Unstuck',
    'Real Plan',
    'Right Fit',
    'Your Heroes',
    'Team of Heroes',
    'Leave the Heavy Lifting to Us',
    'Lead Like a Hero',
    // Single power words (fallback)
    'Heroes',
    'Hero',
    'Clarity',
    'Unstuck',
    'Support',
    'Victory',
    'Freedom',
    'Mission',
    'Elite',
    'Success',
];

/**
 * Applies gradient styling to buzz phrases in a headline.
 * Returns the headline with <span class="text-gradient"> wrapped around the phrase.
 * Only applies ONE gradient per headline to keep it clean.
 * If headline already contains span tags, it's returned unchanged.
 */
export function applyHeadlineGradient(headline: string): string {
    if (!headline) return headline;

    // If already has span tags, return as-is
    if (headline.includes('<span')) {
        return headline;
    }

    // Sort phrases by length (longest first) to match full phrases before partial ones
    const sortedPhrases = [...BUZZ_PHRASES].sort((a, b) => b.length - a.length);

    for (const phrase of sortedPhrases) {
        // Create case-insensitive regex that matches the phrase
        const regex = new RegExp(
            `(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
            'gi',
        );

        if (regex.test(headline)) {
            // Apply gradient to the first match only
            return headline.replace(
                regex,
                '<span class="text-gradient">$1</span>',
            );
        }
    }

    // No buzz phrase found, return unchanged
    return headline;
}

/**
 * Strips gradient HTML from a headline, returning plain text.
 * Useful for editing purposes.
 */
export function stripHeadlineGradient(headline: string): string {
    if (!headline) return headline;
    return headline.replace(
        /<span class="text-gradient">([^<]+)<\/span>/g,
        '$1',
    );
}
