'use strict';

const STORAGE_KEY = 'bretzel-defense.unlocked-levels';
const DEFAULT_UNLOCKED_LEVELS = ['level01'];

const getStorage = function() {
    try {
        if(typeof window === 'undefined' || !window.localStorage) {
            return null;
        }

        return window.localStorage;
    } catch(e) {
        return null;
    }
};

const sanitizeUnlockedLevels = function(levelids) {
    const normalized = [];
    const seen = {};

    const list = Array.isArray(levelids) ? levelids : [];
    for(let i = 0; i < list.length; i++) {
        const levelid = list[i];
        if(typeof levelid !== 'string') {
            continue;
        }

        if(seen[levelid]) {
            continue;
        }

        seen[levelid] = true;
        normalized.push(levelid);
    }

    for(let i = 0; i < DEFAULT_UNLOCKED_LEVELS.length; i++) {
        const levelid = DEFAULT_UNLOCKED_LEVELS[i];
        if(seen[levelid]) {
            continue;
        }

        seen[levelid] = true;
        normalized.push(levelid);
    }

    return normalized;
};

const readUnlockedLevels = function() {
    const storage = getStorage();
    if(!storage) {
        return sanitizeUnlockedLevels(DEFAULT_UNLOCKED_LEVELS);
    }

    try {
        const raw = storage.getItem(STORAGE_KEY);
        if(!raw) {
            return sanitizeUnlockedLevels(DEFAULT_UNLOCKED_LEVELS);
        }

        return sanitizeUnlockedLevels(JSON.parse(raw));
    } catch(e) {
        return sanitizeUnlockedLevels(DEFAULT_UNLOCKED_LEVELS);
    }
};

const writeUnlockedLevels = function(levelids) {
    const sanitized = sanitizeUnlockedLevels(levelids);
    const storage = getStorage();

    if(storage) {
        storage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    }

    return sanitized;
};

export const getUnlockedLevels = function() {
    return readUnlockedLevels();
};

export const isLevelUnlocked = function(levelid) {
    if(typeof levelid !== 'string') {
        return false;
    }

    return readUnlockedLevels().indexOf(levelid) !== -1;
};

export const unlockLevel = function(levelid) {
    if(typeof levelid !== 'string') {
        return readUnlockedLevels();
    }

    return writeUnlockedLevels(readUnlockedLevels().concat([levelid]));
};

export const unlockLevels = function(levelids) {
    return writeUnlockedLevels(readUnlockedLevels().concat(levelids || []));
};

export const resetProgressionForTests = function() {
    const storage = getStorage();
    if(storage) {
        storage.removeItem(STORAGE_KEY);
    }
};
