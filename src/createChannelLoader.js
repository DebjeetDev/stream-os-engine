function parseChannels(rawdata) {
  if (typeof rawdata !== "string") {
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
  if (channels.length === 0) return { status: 200, ok: true, data: [] };

  return { status: 200, ok: true, data: channels };
}
function validateChannel(channel) {
  if (
    Array.isArray(channel) ||
    channel === null ||
    channel === undefined ||
    typeof channel !== "object"
  ) {
    return { status: 400, ok: false, error: "Channel must be an object!" };
  }

  if (
    typeof channel.id !== "string" ||
    channel.id.trim() === "" ||
    typeof channel.name !== "string" ||
    channel.name.trim() === ""
  ) {
    return {
      status: 400,
      ok: false,
      error: "Channel must have a valid id and name!",
    };
  }

  return { status: 200, ok: true };
}
function normalizeChannel(channel) {
  if (
    Array.isArray(channel) ||
    channel === null ||
    channel === undefined ||
    typeof channel !== "object"
  ) {
    return { status: 400, ok: false, error: "Channel must be an object!" };
  }
  const normalized = {
    id: channel.id ? String(channel.id).trim() : "",
    name: channel.name ? String(channel.name).trim() : "",
    altNames: Array.isArray(channel.alt_names) ? [...channel.alt_names] : [],
    network: typeof channel.network === "string" ? channel.network : null,
    owners: Array.isArray(channel.owners) ? [...channel.owners] : [],
    country:
      typeof channel.country === "string"
        ? channel.country.trim().toUpperCase()
        : null,
    categories: Array.isArray(channel.categories)
      ? [...channel.categories]
      : [],
    isNsfw: channel.is_nsfw === true,
    launched: typeof channel.launched === "string" ? channel.launched : null,
    closed: typeof channel.closed === "string" ? channel.closed : null,
    replacedBy:
      typeof channel.replaced_by === "string" ? channel.replaced_by : null,
    website: typeof channel.website === "string" ? channel.website : null,
  };
  return { status: 200, ok: true, data: normalized };
}
function normalizeChannels(channels) {
  if (
    !Array.isArray(channels) ||
    channels === null ||
    channels === undefined ||
    typeof channels !== "object"
  ) {
    return { status: 400, ok: false, error: "Channels must be an array!" };
  }
  const seen = new Set();
  const normalizedChannels = [];
  for (const channel of channels) {
    const validation = validateChannel(channel);
    if (!validation.ok) {
      continue; // Skip invalid channels
    }
    if (channel.is_nsfw !== false) {
      continue;
    }
    const normalizedResult = normalizeChannel(channel);
    const normaliaziedId = normalizedResult.data.id;
    if (seen.has(normaliaziedId)) continue;
    seen.add(normaliaziedId);
    normalizedChannels.push(normalizedResult.data);
  }
  return { status: 200, ok: true, data: normalizedChannels };
}
function createChannelLoader() {
  let channels = [];
  return {
    async loadChannels() {
      try {
        const res = await fetch("https://iptv-org.github.io/api/channels.json");
        if (!res.ok) {
          return {
            status: res.status,
            ok: false,
            error: `API Error: ${res.statusText || "Unknown Error"}`,
          };
        }
        const data = await res.text();
        const parsed = parseChannels(data);
        if (!parsed.ok) {
          return parsed;
        }
        const cleaned = normalizeChannels(parsed.data);
        channels = cleaned.data;
        return { status: 200, ok: true, data: channels };
      } catch (error) {
        return { status: 500, ok: false, error: "Network problem!" };
      }
    },

    getChannels() {
      return channels.map((channel) => ({
        ...channel,
        categories: channel.categories ? [...channel.categories] : [],
        altNames: channel.altNames ? [...channel.altNames] : [],
        owners: channel.owners ? [...channel.owners] : [],
      }));
    },

    getChannelsByCountry(code) {
      if (typeof code !== "string" || code.trim() === "")
        return {
          status: 400,
          ok: false,
          error: "Country code must be a non-empty string",
        };
      const filteredChannelsBycountry = this.getChannels().filter(
        (ch) => ch.country === code.trim().toUpperCase(),
      );
      return {
        status: 200,
        ok: true,
        data: filteredChannelsBycountry,
      };
    },

    getChannelsByCategory(category) {
      if (typeof category !== "string" || category.trim() === "") {
        return {
          status: 400,
          ok: false,
          error: "category must be a non-empty string",
        };
      }
      const normalizedCategory = category.trim().toLocaleLowerCase();
      const filteredChannelsBycategories = this.getChannels().filter((ch) =>
        ch.categories.includes(normalizedCategory),
      )
      return {
        status: 200,
        ok: true,
        data: filteredChannelsBycategories
      }
    },

    searchChannels(query) {
      if (typeof query !== "string") {
        return {
          status: 400,
          ok: false,
          error: "query must be a non-empty string"
        }
      }
      if (query.trim() === "") {
        return { status: 200, ok: true, data: [] }
      }
      const nomalizeQuery = query.trim().toLocaleLowerCase();
      const filteredChannelsBySearch = this.getChannels().filter((ch) => {
        const nameMatch = ch.name.toLowerCase().includes(nomalizeQuery);
        const altMatch = (ch.altNames || []).some((alt) => {
         return alt.toLowerCase().includes(nomalizeQuery)
        })
        return nameMatch || altMatch
      })
      return {
        status: 200,
        ok: true,
        data: filteredChannelsBySearch
      }
    }

  }
}
  module.exports = {
    parseChannels,
    validateChannel,
    normalizeChannel,
    normalizeChannels,
    createChannelLoader,
  };
