/* === Storage Utilities ===*/
type value = {
    [key: string]: any;
};
export const updateLocalStorage = (rootKey: string, storageValue: value): void => {
    const data: object = JSON.parse(window.localStorage.getItem(rootKey));
    if (!data) {
        localStorage.setItem(rootKey, JSON.stringify(storageValue));
        return;
    }
    const newData = {
        ...data,
        ...storageValue,
    };
    localStorage.setItem(rootKey, JSON.stringify(newData));
};

export const removeItemInStorage = (rootKey: string, storageKey: string): string => {
    const data: value = JSON.parse(window.localStorage.getItem(rootKey));
    if (!data) {
        return 'error';
    }
    delete data[storageKey];
    localStorage.setItem(rootKey, JSON.stringify(data));

    return 'success';
};

export const getItemInStorage = (rootKey: string, storageKey: string): any => {
    const data: value = JSON.parse(window.localStorage.getItem(rootKey));
    if (data) {
        return data[storageKey];
    }
    return null;
};
export const deleteRootStorage = (rootKey: string): void => {
    localStorage.removeItem(rootKey);
};
export const generateRootKey = (queueCustomername: string, id: string): string => `${id}`;
/* =================== */

function exists(o: unknown): boolean {
    return o !== undefined && o !== null;
}

function isBool(o: unknown): boolean {
    return o === true || o === false;
}

function isString(o: unknown): boolean {
    return (exists(o) && typeof o === 'string') || o instanceof String;
}

function isNumber(o: unknown): boolean {
    return exists(o) && (typeof o === 'number' || o instanceof Number) && !isNaN(o as number);
}

function isArray(o: unknown): boolean {
    return exists(o) && Array.isArray(o);
}

function isEmail(o: unknown): boolean {
    return isString(o) && /^.+@.+\..+$/u.test(o as string);
}

function isPassword(o: unknown): boolean {
    function validLength(s: string) {
        const maxLength = 72; // bcrypt implementation uses only first 72 characters of a string
        const minLength = 8;
        return s.length <= maxLength && s.length >= minLength;
    }

    function containsNumber(s: string) {
        return /.*[0-9].*/u.test(s);
    }

    function containsUpperCase(s: string) {
        return /.*[A-Z].*/u.test(s);
    }

    function containsLowerCase(s: string) {
        return /.*[a-z].*/u.test(s);
    }

    return (
        isString(o) &&
        validLength(o as string) &&
        containsNumber(o as string) &&
        containsUpperCase(o as string) &&
        containsLowerCase(o as string)
    );
}

function isUuid(o: unknown): boolean {
    return (
        isString(o) && /^[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/iu.test(o as string)
    );
}

function isId(o: unknown): boolean {
    return isNumber(Number(o));
}

function isDate(o: unknown): boolean {
    return exists(o) && (o instanceof Date || !isNaN(Date.parse(o as string)));
}

function isPhone(o: unknown): boolean {
    return (
        isString(o) &&
        /^((\+?\d\d?\d?)|0)((\d\d-\d{3}-\d{4})|(\d\d-\d{4}-\d{3})|(\d\d?-?\d{7})|(\d-\d{4}-\d{4}))$/u.test(o as string)
    );
}

function isUrl(o: unknown): boolean {
    if (!isString(o)) {
        return false;
    }
    try {
        new URL(o as string);
    } catch (_) {
        return false;
    }
    return true;
}

function isColor(o: unknown): boolean {
    return isString(o) && /^#([0-9A-Fa-f]{3}){1,2}$/u.test(o as string);
}

function each<T = unknown>(arr: Array<T>, cb: (arg0: T) => boolean): boolean {
    return arr.reduce<boolean>((prev: boolean, cur: T) => prev && cb(cur), true);
}

export default {
    exists,
    isBool,
    isString,
    isNumber,
    isArray,
    isEmail,
    isPassword,
    isUuid,
    isId,
    isDate,
    isPhone,
    isUrl,
    isColor,
    each,
    updateLocalStorage,
    removeItemInStorage,
    generateRootKey,
    getItemInStorage,
};
