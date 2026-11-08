
function parseChannels(rawdata) {
    if (typeof rawdata !== 'string') {
        return { status: 400, ok: false, error: "JSON must be a string!" };
    }
    let channels;
    try {
        channels = JSON.parse(rawdata);
    } catch (error) {
        return { status: 400, ok: false, error: "Invalid JSON format!" };
    }
    if (!Array.isArray(channels)) {
        return { status: 400, ok: false, error: "JSON must be an array!" };
    }
    if (channels.length === 0) return { status: 200, ok: true, data: [] }

    return { status: 200, ok: true, data: channels };

}

function validateChannel(channel) {
 if(Array.isArray(channel) || channel === null || channel === undefined || typeof channel !== 'object') {
    return { status: 400, ok: false, error: "Channel must be an object!" };
 }

 if(
    typeof channel.id !== 'string' || channel.id.trim() === '' ||
    typeof channel.name !== 'string' || channel.name.trim() === ''
 ) {
    return { status: 400, ok: false, error: "Channel must have a valid id and name!" };
 }

 return { status: 200, ok: true };
}
function normalizeChannel(channel){
 if(!channel || typeof channel !== 'object') {
    return { status: 400, ok: false, error: "Channel must be an object!" };
 }
 const normalized = {
    id: channel.id ? String(channel.id).trim() : '',
    name: channel.name ? String(channel.name).trim() : '',
    altName: channel.altName ?? [],
    network: channel.network ?? null,
    owner: channel.owner ?? [],
    country: channel.country ?? '',
    categories: channel.categories ?? [],
    isNsfw: channel.isNsfw ?? false,
    launched:channel.launched ?? null,
    closed:channel.closed ?? null,
    replacedBy: ,
    website:
 }
}

module.exports = { parseChannels , validateChannel, normalizeChannel };