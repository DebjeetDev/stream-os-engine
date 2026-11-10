
function createPlayer() {
    let currentChannel = null;
    let currentIndex = 0;
    return {
        play(channel) {
            if (!channel || typeof channel !== "object") {
                return { status: 400, ok: false, error: "Channel is required" };
            }
            if (!Array.isArray(channel.streams) || channel.streams.length === 0) {
                return { status: 400, ok: false, error: "Channel has no streams" };
            }
            currentChannel = channel;
            currentIndex = 0;
            const stream = currentChannel.streams[currentIndex];
            return {
                status: 200,
                ok: true,
                data: {
                    name: currentChannel.name,
                    url: stream.url,
                    quality: stream.quality,
                    streamIndex: currentIndex,
                    totalStreams: currentChannel.streams.length
                }
            }
        },
        
        next() {
            if (!currentChannel) {
                return { status: 404, ok: false, error: "No channel is playing" };
            }
            currentIndex++

            if (currentIndex >= currentChannel.streams.length) {
                return { status: 404, ok: false, error: "No working stream left for this channel" };
            } 
            const stream = currentChannel.streams[currentIndex];
            return {
                status: 200,
                ok: true,
                data: {
                    name: currentChannel.name,
                    url: stream.url,
                    quality: stream.quality,
                    streamIndex: currentIndex,
                    totalStreams: currentChannel.streams.length
                }
            }
        },

        stop() {
            currentChannel = null;
            currentIndex = 0;
            return { status: 200, ok: true, data: null };
        }
    }
}

module.exports = { createPlayer };