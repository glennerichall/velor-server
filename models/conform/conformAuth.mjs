export function conformAuth(auth) {
    if (!auth) return null;
    return {
        id: auth.id,
        provider: auth.provider,
        verified: auth.verified,
        firstName: auth.firstname ?? auth.first_name ?? auth.firstName,
        lastName: auth.lastname ?? auth.last_name ?? auth.lastName,
        avatar: auth.avatar,
        profileId: auth.profileId ?? auth.profile_id ?? auth.profileid ?? auth.auth_id ?? auth.authid,
        email: auth.email,
        displayName: auth.displayName ?? auth.display_name ?? auth.displayname,
    }
}