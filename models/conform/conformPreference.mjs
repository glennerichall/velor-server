export function conformPreference(pref) {
    if(!pref) return null;

    return {
        ...defaultPrefs[pref.name],
        ...pref.value
    }
}