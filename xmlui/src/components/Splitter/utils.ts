export const parseSize = (size: string, containerSize: number): number => {
    if (size.endsWith('px')) {
        return parseInt(size, 10);
    } else if (size.endsWith('%')) {
        return (parseInt(size, 10) / 100) * containerSize;
    }
    throw new Error('Invalid size format. Use px or %.');
};

export const toPercentage = (size: number, containerSize: number): number => {
    return (size / containerSize) * 100;
};
