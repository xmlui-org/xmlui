export const parseSize = (size: string, containerSize: number): number => {
    if (size.endsWith('px')) {
        const pixels = parseInt(size, 10);
        // If negative, calculate from the end: containerSize - abs(pixels)
        return pixels < 0 ? containerSize + pixels : pixels;
    } else if (size.endsWith('%')) {
        const percentage = parseInt(size, 10);
        // If negative, calculate from the end: 100% - abs(percentage)
        const actualPercentage = percentage < 0 ? 100 + percentage : percentage;
        return (actualPercentage / 100) * containerSize;
    }
    throw new Error('Invalid size format. Use px or %.');
};

export const toPercentage = (size: number, containerSize: number): number => {
    return (size / containerSize) * 100;
};
