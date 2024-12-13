export function conformPreference(pref) {
    if (!pref) return null;

    return {
        id: pref.id,
        userId: pref.user_id ?? pref.userid ?? pref.userId,
        name: pref.name,
        value: pref.value
    };
}