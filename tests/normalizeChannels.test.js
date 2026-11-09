const test = require("node:test")
const assert = require("node:assert/strict");
const { normalizeChannels } = require("../src/createChannelLoader.js");

test("giev valid res with valid data",()=>{
    const result = normalizeChannels([
     { id: "a.in", name: "A", is_nsfw: false },
     { id: "b.in", name: "B", is_nsfw: false },
    ])
     assert.equal(result.status, 200);
  assert.equal(result.ok, true);
  assert.equal(result.data.length, 2);
  assert.equal(result.data[0].id, "a.in");
  assert.equal(result.data[1].id, "b.in");
})