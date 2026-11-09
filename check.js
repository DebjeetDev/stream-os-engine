const { createChannelLoader } = require("./src/createChannelLoader.js");

const loader = createChannelLoader();

loader.loadChannels().then((r) => {
  console.log("Load:", r.status, r.data.length);

  const a = loader.searchChannels("ananda");
  console.log("ananda:", a.data);

  const b = loader.searchChannels("ANANDA");
  console.log("ANANDA:", b.data);

  const c = loader.searchChannels("xyzqq");
  console.log("xyzqq:", c.data);
});