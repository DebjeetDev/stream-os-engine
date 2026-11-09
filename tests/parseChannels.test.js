
const test = require("node:test");
const assert = require("node:assert/strict");

const { parseChannels } = require("../src/createChannelLoader.js");

test("should parse an empty array", () => {
  const result = parseChannels("[]");

  assert.deepEqual(result, {
    status: 200,
    ok: true,
    data: [],
  });
});

test("should parse a single channel", () => {
  const result = parseChannels('[{"id":"a","name":"A"}]');

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].id, "a");
});

test("should parse multiple channels", () => {
  const result = parseChannels(
    '[{"id":"a","name":"A"},{"id":"b","name":"B"}]'
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 2);
});

test("should reject an object instead of an array", () => {
  const result = parseChannels('{"id":"a"}');

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("should reject null as the root value", () => {
  const result = parseChannels("null");

  assert.equal(result.ok, false);
});

test("should reject invalid JSON", () => {
  const result = parseChannels("hello");

  assert.equal(result.ok, false);
});

test("should reject an empty string", () => {
  const result = parseChannels("");

  assert.equal(result.ok, false);
});

test("should reject JavaScript arrays as input", () => {
  const result = parseChannels([]);

  assert.equal(result.ok, false);
});

test("should reject undefined", () => {
  const result = parseChannels(undefined);

  assert.equal(result.ok, false);
});

test("should return the complete success result structure", () => {
  const result = parseChannels('[{"id":"test","name":"Test"}]');

  assert.deepEqual(result, {
    status: 200,
    ok: true,
    data: [{ id: "test", name: "Test" }],
  });
});
