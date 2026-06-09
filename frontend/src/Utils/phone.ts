export interface CountryOption {
    code: string;
    flag: string;
    name: string;
}

export const countries: CountryOption[] = [
    { code: '+55', flag: '🇧🇷', name: 'Brasil (+55)' },
    { code: '+1', flag: '🇺🇸', name: 'EUA/Canadá (+1)' },
    { code: '+351', flag: '🇵🇹', name: 'Portugal (+351)' },
    { code: '+34', flag: '🇪🇸', name: 'Espanha (+34)' },
    { code: '+44', flag: '🇬🇧', name: 'Reino Unido (+44)' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina (+54)' },
    { code: '+598', flag: '🇺🇾', name: 'Uruguai (+598)' },
    { code: '+56', flag: '🇨🇱', name: 'Chile (+56)' },
    { code: '+57', flag: '🇨🇴', name: 'Colômbia (+57)' },
    { code: '+51', flag: '🇵🇪', name: 'Peru (+51)' },
];

export const parsePhone = (fullPhone: string | undefined) => {
    if (!fullPhone) return { countryCode: '+55', number: '' };
    
    // Sort by code length descending to match longest code first (e.g. +598 before +5)
    const sortedCountries = [...countries].sort((a, b) => b.code.length - a.code.length);
    for (const country of sortedCountries) {
        if (fullPhone.startsWith(country.code)) {
            return {
                countryCode: country.code,
                number: fullPhone.substring(country.code.length)
            };
        }
    }
    
    // Fallback: If it starts with '55' and is at least 10/11 digits long, treat as Brazil
    const cleanPhone = fullPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('55') && cleanPhone.length >= 10) {
        return { countryCode: '+55', number: cleanPhone.substring(2) };
    }
    
    return { countryCode: '+55', number: fullPhone };
};
