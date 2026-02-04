// Section summaries for sections 3-7 that require initials
export const INITIALING_SECTIONS = [
    {
        number: 3,
        key: 'compensation',
        title: 'Compensation',
        summary:
            'You agree to pay the monthly service fee as stated. Payment is due on the 1st of each month via credit card or ACH transfer.',
    },
    {
        number: 4,
        key: 'relationship',
        title: 'Relationship of Parties',
        summary:
            'Cynergists operates as an independent contractor. This agreement does not create an employment, partnership, or joint venture relationship.',
    },
    {
        number: 5,
        key: 'confidentiality',
        title: 'Confidentiality',
        summary:
            'Both parties commit to keeping proprietary information confidential during and after the engagement.',
    },
    {
        number: 6,
        key: 'ip',
        title: 'Intellectual Property',
        summary:
            'Work created specifically for you becomes your property upon full payment. Cynergists retains rights to pre-existing materials and general methodologies.',
    },
    {
        number: 7,
        key: 'liability',
        title: 'Limitation of Liability',
        summary:
            "Cynergists' total liability is limited to the fees paid in the preceding three months.",
    },
];

export const getDefaultInitials = (clientName: string): string => {
    if (!clientName) return '';
    const names = clientName.trim().split(/\s+/);
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    return (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
};
