export function conformApiKey(apiKey) {
    if(!apiKey) return null;
    return {
        id: apiKey.id,
        value: apiKey.value,
        creation: apiKey.creation,
        name: apiKey.name,
        publicId: apiKey.publicId ?? apiKey.public_id,
        lastUsed: apiKey.lastUsed ?? apiKey.last_used,
        privateId: apiKey.privateId ?? apiKey.raw_uuid,
    };
}