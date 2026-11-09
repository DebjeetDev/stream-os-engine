const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeChannel } = require("../src/createChannelLoader.js");

test("normalizeChannel should return an error for invalid input", () => {
  const invalidInputs = [null, undefined, [], "string", 123, true];
  invalidInputs.forEach((input) => {
    const result = normalizeChannel(input);
    assert.strictEqual(result.status, 400);
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.error, "Channel must be an object!");
  });
});

test("normalizeChannel should return normalized channel for valid input", () => {
  const input = {
    id: " 123 ",
    name: " Test Channel ",
    alt_names: ["Alt1", "Alt2"],
    network: "Test Network",
    owners: ["Owner1", "Owner2"],
    country: "us",
    categories: ["Category1", "Category2"],
    is_nsfw: true,
    launched: "2020-01-01",
    closed: null,
    replaced_by: null,
    website: "https://testchannel.com",
  };

  const expectedOutput = {
    id: "123",
    name: "Test Channel",
    altNames: ["Alt1", "Alt2"],
    network: "Test Network",
    owners: ["Owner1", "Owner2"],
    country: "US",
    categories: ["Category1", "Category2"],
    isNsfw: true,
    launched: "2020-01-01",
    closed: null,
    replacedBy: null,
    website: "https://testchannel.com",
  };

  const result = normalizeChannel(input);
  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.data, expectedOutput);
});
