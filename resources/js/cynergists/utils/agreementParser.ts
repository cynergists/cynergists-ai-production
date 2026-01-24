/**
 * Agreement Parser Utility
 * 
 * Provides functions to dynamically extract initial requirements from agreement templates.
 * This creates a single source of truth for the signing workflow.
 */

export interface SectionRequirement {
  sectionKey: string;
  sectionTitle: string;
  sectionSummary: string;
  orderIndex: number;
}

/**
 * Extracts initials requirements from template content by finding {{CLIENT_INITIALS}} markers.
 * Returns an array of section requirements with deterministic keys.
 */
export function extractInitialsRequirements(templateContent: string): SectionRequirement[] {
  const INITIALS_MARKER = /\{\{CLIENT_INITIALS\}\}/gi;
  const matches = templateContent.match(INITIALS_MARKER);
  
  if (!matches) {
    return [];
  }
  
  const count = matches.length;
  
  // Generate deterministic section keys based on count
  const sections: SectionRequirement[] = [];
  
  for (let i = 0; i < count; i++) {
    sections.push({
      sectionKey: `section_${i + 1}`,
      sectionTitle: `Section ${i + 1}`,
      sectionSummary: "",
      orderIndex: i,
    });
  }
  
  return sections;
}

/**
 * Extracts section keys from template content.
 * These keys are used to track initials completion.
 */
export function getSectionKeysFromTemplate(templateContent: string): string[] {
  const sections = extractInitialsRequirements(templateContent);
  return sections.map(s => s.sectionKey);
}

/**
 * Counts the number of initials required in a template.
 */
export function countRequiredInitials(templateContent: string): number {
  const INITIALS_MARKER = /\{\{CLIENT_INITIALS\}\}/gi;
  const matches = templateContent.match(INITIALS_MARKER);
  return matches ? matches.length : 0;
}

/**
 * Checks if all required initials are complete.
 */
export function areAllInitialsComplete(
  templateContent: string,
  sectionInitials: Record<string, string>
): boolean {
  const requiredKeys = getSectionKeysFromTemplate(templateContent);
  const completedCount = requiredKeys.filter(key => !!sectionInitials[key]).length;
  
  return completedCount === requiredKeys.length && requiredKeys.length > 0;
}

/**
 * Gets the next incomplete section key, or null if all are complete.
 */
export function getNextIncompleteSection(
  sectionKeys: string[],
  sectionInitials: Record<string, string>,
  currentSectionKey?: string
): string | null {
  const currentIndex = currentSectionKey 
    ? sectionKeys.indexOf(currentSectionKey) 
    : -1;
  
  for (let i = currentIndex + 1; i < sectionKeys.length; i++) {
    if (!sectionInitials[sectionKeys[i]]) {
      return sectionKeys[i];
    }
  }
  
  return null;
}

/**
 * Creates a progress summary for the signing flow.
 */
export function getSigningProgress(
  sectionKeys: string[],
  sectionInitials: Record<string, string>,
  hasSignature: boolean
): {
  requiredInitials: number;
  completedInitials: number;
  allInitialsComplete: boolean;
  hasSignature: boolean;
  isFullyComplete: boolean;
  progressText: string;
} {
  const requiredInitials = sectionKeys.length;
  const completedInitials = sectionKeys.filter(key => !!sectionInitials[key]).length;
  const allInitialsComplete = completedInitials === requiredInitials && requiredInitials > 0;
  const isFullyComplete = allInitialsComplete && hasSignature;
  
  let progressText = "";
  if (!allInitialsComplete) {
    progressText = `${completedInitials} of ${requiredInitials} sections initialed`;
  } else if (!hasSignature) {
    progressText = "All sections initialed - signature required";
  } else {
    progressText = "Agreement complete";
  }
  
  return {
    requiredInitials,
    completedInitials,
    allInitialsComplete,
    hasSignature,
    isFullyComplete,
    progressText,
  };
}
