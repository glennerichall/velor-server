export function conformPreference(pref) {
    if (!pref) return null;

    if (pref.value?.value !== undefined &&
        Object.keys(pref.value).length === 1) {
        pref.value = pref.value.value;
    }

    return {
        id: pref.id,
        userId: pref.user_id ?? pref.userid ?? pref.userId,
        name: pref.name,
        value: pref.value
    };
}