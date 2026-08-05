const supportedLanguages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'c',
    'go',
    'rust',
];

export const normalizeLanguage = (language) => {
    const normalized = language.toLowerCase().trim();
    return normalized === 'c++' ? 'cpp' : normalized;
};

export const validateCode = (code, language) => {
    if (typeof code !== 'string' || !code.trim()) {
        return {
            valid: false,
            message: 'Code is required',
        };
    }

    if (!language || typeof language !== 'string') {
        return {
            valid: false,
            message: 'Programming language is required',
        };
    }

    const normalizedLanguage = normalizeLanguage(language);

    if (!supportedLanguages.includes(normalizedLanguage)) {
        return {
            valid: false,
            message: `Unsupported language: ${language}`,
        };
    }

    // Limit code size
    if (code.length > 50000) {
        return {
            valid: false,
            message: 'Code is too large. Maximum 50,000 characters.',
        };
    }

    return {
        valid: true,
    };
};

export const getCodeStats = (code) => {
    const lines = code.split('\n');

    const totalLines = lines.length;

    const emptyLines = lines.filter(
        (line) => line.trim() === ''
    ).length;

    const codeLines = totalLines - emptyLines;

    return {
        totalLines,
        emptyLines,
        codeLines,
        characters: code.length,
    };
};
