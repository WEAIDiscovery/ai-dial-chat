export const snake2camel = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(item => snake2camel(item));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());
            acc[camelKey] = snake2camel(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};

export const camel2snake = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(item => camel2snake(item));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            acc[snakeKey] = camel2snake(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};
