/**
 * Format amount to Philippine Peso (PHP)
 */
export function formatPHP(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined || amount === '') {
        return '₱0.00';
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
        return '₱0.00';
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numAmount);
}

/**
 * Format Philippine phone number
 * Accepts: 09123456789, +639123456789, 9123456789
 * Returns: +63 912 345 6789
 */
export function formatPhoneNumberPH(phone: string | null | undefined): string {
    if (!phone) return '';

    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle different formats
    if (cleaned.startsWith('63')) {
        // Already has country code
        cleaned = cleaned;
    } else if (cleaned.startsWith('0')) {
        // Remove leading 0 and add country code
        cleaned = '63' + cleaned.substring(1);
    } else if (cleaned.length === 10) {
        // No leading 0, add country code
        cleaned = '63' + cleaned;
    }

    // Format: +63 912 345 6789
    if (cleaned.length === 12 && cleaned.startsWith('63')) {
        return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
    }

    return phone; // Return original if format doesn't match
}

/**
 * Validate Philippine mobile number
 * Valid formats: 09XX XXX XXXX, +639XX XXX XXXX
 */
export function isValidPhoneNumberPH(phone: string): boolean {
    if (!phone) return false;

    const cleaned = phone.replace(/\D/g, '');

    // Check if it's a valid PH mobile number
    if (cleaned.startsWith('63') && cleaned.length === 12) {
        const prefix = cleaned.substring(2, 5);
        return ['905', '906', '907', '908', '909', '910', '911', '912', '913', '914', '915', '916', '917', '918', '919', '920', '921', '922', '923', '924', '925', '926', '927', '928', '929', '930', '931', '932', '933', '934', '935', '936', '937', '938', '939', '940', '941', '942', '943', '944', '945', '946', '947', '948', '949', '950', '951', '963', '964', '965', '966', '967', '968', '969', '970', '971', '972', '973', '974', '975', '976', '977', '978', '979', '980', '981', '989', '992', '993', '994', '995', '996', '997', '998', '999'].includes(prefix);
    }

    if (cleaned.startsWith('0') && cleaned.length === 11) {
        const prefix = cleaned.substring(0, 4);
        return ['0905', '0906', '0907', '0908', '0909', '0910', '0911', '0912', '0913', '0914', '0915', '0916', '0917', '0918', '0919', '0920', '0921', '0922', '0923', '0924', '0925', '0926', '0927', '0928', '0929', '0930', '0931', '0932', '0933', '0934', '0935', '0936', '0937', '0938', '0939', '0940', '0941', '0942', '0943', '0944', '0945', '0946', '0947', '0948', '0949', '0950', '0951', '0963', '0964', '0965', '0966', '0967', '0968', '0969', '0970', '0971', '0972', '0973', '0974', '0975', '0976', '0977', '0978', '0979', '0980', '0981', '0989', '0992', '0993', '0994', '0995', '0996', '0997', '0998', '0999'].includes(prefix);
    }

    return false;
}

/**
 * Philippine Regions
 */
export const PH_REGIONS = [
    'NCR - National Capital Region',
    'CAR - Cordillera Administrative Region',
    'Region I - Ilocos Region',
    'Region II - Cagayan Valley',
    'Region III - Central Luzon',
    'Region IV-A - CALABARZON',
    'Region IV-B - MIMAROPA',
    'Region V - Bicol Region',
    'Region VI - Western Visayas',
    'Region VII - Central Visayas',
    'Region VIII - Eastern Visayas',
    'Region IX - Zamboanga Peninsula',
    'Region X - Northern Mindanao',
    'Region XI - Davao Region',
    'Region XII - SOCCSKSARGEN',
    'Region XIII - Caraga',
    'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao',
];

/**
 * Format Philippine address/location
 */
export function formatLocationPH(city: string, region?: string): string {
    if (region) {
        return `${city}, ${region}`;
    }
    return city;
}
