# STREAM-OS — Module 02: Channel Loader Engine

**Ticket:** STREAM-202  
**Goal:** Build a dependency-free JavaScript module that loads channel metadata, validates it, normalizes it, stores it privately, and provides safe search/filter methods.

**Learning rule:** You write the implementation. I explain concepts, give hints first, and review your code honestly.

---

## 1. What are we building?

STREAM-OS is being developed in independent modules:

| Module | Responsibility |
|---|---|
| 01 — Subscription Plan Engine | Manages subscription plan prices and PIN-protected actions |
| 02 — Channel Loader Engine | Loads external channel metadata and turns it into a clean catalogue |
| 03 — Stream Resolver | Later connects channel records to stream records |
| 04 — Player Bridge | Later handles playback integration |
| 05 — Remote UI | Later provides the user interface |

**Module 02 handles metadata only.** It does not play video, test whether a stream works, download logos, or build a UI.

### The problem

An external source can return thousands of channel records. Some records may have missing fields, invalid values, duplicate IDs, or unexpected data types.

The engine will:

1. Retrieve the dataset.
2. Parse JSON text into JavaScript values.
3. Validate individual records.
4. Normalize records into one consistent shape.
5. Remove duplicate IDs using a documented rule.
6. Exclude records marked as adult content from the normal catalogue.
7. Keep the stored catalogue private.
8. Return safe results for search and filtering.

---

## 2. Data source

We will use the public channel metadata dataset from **iptv-org**:

- Dataset: https://iptv-org.github.io/api/channels.json
- Documentation: https://github.com/iptv-org/api

This dataset describes channels. It is not itself a playlist of playable video URLs.

Common source fields:

| Field | Meaning | Example |
|---|---|---|
| `id` | Channel identifier | `"AnhuiTV.cn"` |
| `name` | Main channel name | `"Anhui TV"` |
| `alt_names` | Alternative names | `["Anhui Satellite TV"]` |
| `network` | Network name or `null` | `"Anhui"` |
| `owners` | Channel owners | `["Example Media"]` |
| `country` | Country code | `"IN"` |
| `categories` | Category IDs | `["general"]` |
| `is_nsfw` | Whether the source marks the channel as adult content | `false` |
| `launched` | Launch date or `null` | `"2016-07-28"` |
| `closed` | Closure date or `null` | `null` |
| `replaced_by` | Replacement channel ID or `null` | `null` |
| `website` | Website URL or `null` | `"https://example.com"` |

The upstream schema may change. Before implementing validation, check the current documentation and decide which fields are required and which are optional.

### Simplified example

This is teaching data, not a claim that these are real channels:

```js
[
  {
    id: "sample-news.in",
    name: "Sample News",
    country: "IN",
    categories: ["news"],
    is_nsfw: false
  },
  {
    id: "sample-sports.in",
    name: "Sample Sports",
    country: "IN",
    categories: ["sports"],
    is_nsfw: false
  }
]
```

Notice:

- The outer value is an array.
- Each item is an object.
- `categories` is an array inside each object.
- `is_nsfw` is a boolean.
- `country`, `id`, and `name` are strings.

---

## 3. Finished module: public API

These are the target methods. We will build them one at a time.

| Method | Input | Responsibility |
|---|---|---|
| `loadChannels()` | Optional configuration | Fetch, parse, validate, normalize, and store the dataset |
| `parseChannels(rawData)` | JSON text | Parse JSON and check that the root value is an array |
| `validateChannel(channel)` | One unknown value | Check whether one record has the required shape |
| `normalizeChannel(channel)` | One valid record | Create a clean internal record |
| `normalizeChannels(channels)` | Array of records | Clean records and remove duplicate IDs |
| `getChannels()` | None | Return a safe copy of the catalogue |
| `getChannelsByCountry(code)` | Country code | Return matching channels |
| `getChannelsByCategory(category)` | Category ID | Return matching channels |
| `searchChannels(query)` | Search text | Search channel names and alternative names |

### Result-object convention

Keep the same consistent result-object idea used in Module 01.

Success:

```js
{
  status: 200,
  ok: true,
  data: []
}
```

Failure:

```js
{
  status: 400,
  ok: false,
  error: "Invalid channel data."
}
```

Use a suitable status for each kind of failure. Do not return contradictory results such as `status: 400` with `ok: true`.

---

## 4. Internal channel shape

The source uses some snake_case names. Our internal records will use camelCase.

```js
{
  id: "sample-news.in",
  name: "Sample News",
  altNames: [],
  network: null,
  owners: [],
  country: "IN",
  categories: ["news"],
  isNsfw: false,
  launched: null,
  closed: null,
  replacedBy: null,
  website: null
}
```

### Normalization rules

- Keep IDs as strings.
- Trim whitespace from IDs and names.
- Store country codes in uppercase.
- Use `altNames`, not `alt_names`, internally.
- Copy arrays instead of reusing source array references.
- Use consistent defaults for absent optional fields.
- Never invent missing metadata.
- Never modify the original input objects.
- Exclude records explicitly marked `is_nsfw: true` from the normal catalogue.
- Treat missing or incorrectly typed adult-content flags conservatively: exclude the record from the normal catalogue until the policy is reviewed.

### Duplicate rule

Use `id` as the unique key.

For version 1, **keep the first valid record** for an ID and ignore later duplicates. Do not silently merge conflicting records.

---

## 5. Private state and immutability

Module 01 introduced closures. Module 02 will use the same idea.

The internal channel array must stay inside the factory function. Other code should not receive a direct reference to it.

Important: this is only a shallow copy:

```js
const copy = [...channels];
```

The array is new, but the channel objects inside it are still shared references. Nested arrays such as `categories` can also be shared.

Public methods must return records that callers can modify without changing the private catalogue. A small record-copy function is enough for this data shape because the records contain primitive values and arrays of strings.

A closure provides encapsulation inside the program; it is not encryption.

---

## 6. Project structure

Keep Module 01 working. Do not rewrite it while building Module 02.

Possible structure:

```text
stream-os-engine/
├── src/
│   ├── createSubscriptionEngine.js
│   └── createChannelLoader.js
├── tests/
│   ├── test-suite.js
│   └── channel-loader.test.js
├── docs/
│   ├── EXPECTED-OUTPUT.txt
│   └── MODULE-02-PLAN.md
├── package.json
├── README.md
└── LICENSE
```

First inspect the repository. Follow its existing test setup and module style rather than restructuring unnecessarily.

### Runtime and dependencies

- Vanilla JavaScript only.
- No React or UI framework in this module.
- No third-party dependencies.
- Follow the project's existing module format. Module 01 currently demonstrates CommonJS with `require`.
- Use Node's built-in test/assertion tools if the current setup supports them.
- Confirm the Node.js version before relying on built-in `fetch`.
- No database or persistent storage.

---

## 7. Development roadmap

### Phase 0 — Inspect the repository

**Purpose:** Understand the project before editing it.

- [ ] Inspect `package.json`.
- [ ] Inspect the Module 01 source.
- [ ] Inspect the current tests and how `npm test` runs.
- [ ] Confirm CommonJS or ES module configuration.
- [ ] Confirm the Node.js version.
- [ ] Make a clean Git commit or create a feature branch.
- [ ] Run the existing Module 01 tests.

**Done when:** You understand the current conventions and can run Module 01 tests before making changes.

### Phase 1 — Parse JSON

**Purpose:** Convert raw JSON text into a JavaScript array.

Function: `parseChannels(rawData)`

Learn:

- JSON text versus JavaScript values
- `JSON.parse()`
- Arrays and objects
- `typeof`
- `Array.isArray()`
- `try/catch`
- Guard clauses and early returns

Rules:

- Accept a JSON string only.
- Reject non-string input.
- Catch malformed JSON.
- Require the parsed root value to be an array.
- Accept an empty array as valid.
- Do not fetch data in this function.
- Do not mutate input.

**Done when:** Valid arrays parse successfully. Malformed JSON, non-string input, and non-array roots return controlled failures.

### Phase 2 — Validate one channel

**Purpose:** Decide whether one unknown value has a usable channel shape.

Function: `validateChannel(channel)`

Learn:

- Objects and properties
- Required versus optional fields
- String, boolean, and array checks
- `Array.isArray()`

Initial validation ideas:

- `id`: non-empty string.
- `name`: non-empty string.
- `country`: valid two-letter code or `null` if the current upstream schema permits it.
- `categories`: array of strings, according to the current schema.
- `is_nsfw`: boolean for records admitted into the normal catalogue.

Check optional fields when present so malformed values cannot crash normalization. Let the current upstream schema guide the exact policy.

**Done when:** Valid records are accepted; `null`, arrays, primitives, missing required values, and wrong field types are handled predictably.

### Phase 3 — Normalize one channel

**Purpose:** Convert one valid source record into our internal shape.

Function: `normalizeChannel(channel)`

Learn:

- Object literals and property mapping
- `trim()`
- `toUpperCase()`
- Default values
- Spread syntax
- Copying nested arrays

Rules:

- Receive a validated record.
- Return a new object.
- Map snake_case source fields to camelCase internal fields.
- Create fresh arrays.
- Do not mutate the input.
- Do not handle network requests here.

**Done when:** The output always follows the documented internal shape and the source object remains unchanged.

### Phase 4 — Normalize the full dataset

**Purpose:** Turn a list of records into a clean catalogue.

Function: `normalizeChannels(channels)`

Learn:

- `filter()`
- `map()`
- `Set`
- Loops and `continue`
- Pure functions
- Duplicate handling
- Immutability

Rules:

- Require an array.
- Reject or skip invalid records using one documented policy.
- Exclude records marked `is_nsfw: true`.
- Handle missing or malformed adult-content flags conservatively.
- Remove duplicate IDs; keep the first valid record.
- Return a new array.
- Never mutate the input array or its objects.

You may later include counts such as accepted, rejected, duplicate, and excluded records. Decide and document the result shape before implementing that feature.

**Done when:** The same input always produces the same normalized output and the input remains unchanged.

### Phase 5 — Build the loader and private state

**Purpose:** Connect pure data-processing functions to the network.

Factory: `createChannelLoader(options)`  
Public method: `loadChannels()`

Learn:

- Factory functions and closures
- `fetch()`
- Promises
- `async/await`
- HTTP response status
- `try/catch`
- Network errors
- State management

Rules:

- Keep the catalogue inside the factory closure.
- Allow a configurable dataset URL.
- Use the official channel metadata endpoint as the default.
- Check the HTTP response before reading its body.
- Parse and normalize the response.
- Store only successfully processed data.
- Return a consistent result object.
- A failed refresh must not replace a previously valid catalogue with broken data.
- Do not expose or log the entire dataset unnecessarily.
- Do not claim that metadata loading verifies stream availability.

**Done when:** Successful requests load the catalogue; HTTP and network failures return controlled results; private state stays protected.

### Phase 6 — Read, search, and filter

Methods:

- `getChannels()`
- `getChannelsByCountry(code)`
- `getChannelsByCategory(category)`
- `searchChannels(query)`

Learn:

- `filter()`
- `includes()`
- `some()`
- `toLowerCase()`
- String trimming
- Copying nested data
- Guard clauses

Rules:

- Country filtering is case-insensitive.
- Category filtering is case-insensitive.
- Search is case-insensitive.
- Search checks the main name and alternative names.
- Empty search text should return an empty result, not every channel.
- Invalid arguments return controlled failures.
- Every returned record is safe to modify externally.
- Filtering never changes private state.

**Done when:** Every method returns correct results and external mutations cannot change the stored catalogue.

### Phase 7 — Automated tests

**Purpose:** Prove the module works, including edge cases.

Use Node's built-in assertion/test tools if compatible with the repository. Tests must fail automatically when actual output differs from expected output. Printing output is not a test.

Target: **40+ meaningful test cases**, not 40 copies of the same test.

| Test group | What to test |
|---|---|
| Parser | Valid JSON, empty array, malformed JSON, non-string input, object root, null root |
| Validation | Valid record, null, array, missing ID, blank ID, missing name, wrong types |
| Normalization | Field mapping, trimming, uppercase country, optional values, fresh arrays |
| Dataset cleaning | Invalid entries, duplicates, first duplicate wins, adult flag true, missing flag, input immutability |
| Loader | Successful fetch, HTTP failure, network failure, malformed response, wrong root type |
| State | Load then read, failed refresh preserves old data, initial empty state |
| Country filter | Exact match, lowercase input, no match, invalid input |
| Category filter | Match, case handling, no match, invalid input |
| Search | Main name, alternative name, case-insensitive, whitespace, empty query |
| Privacy | Mutating returned array, object, and nested array |

Use a mocked `fetch` function. Unit tests must not depend on the real internet.

**Done when:** All tests pass locally, failures are meaningful, and Module 01 regression tests still pass.

### Phase 8 — Documentation and release

Update:

- `README.md`
- `docs/MODULE-02-PLAN.md`
- `docs/EXPECTED-OUTPUT.txt`
- Usage examples
- Test instructions
- Runtime requirements
- Known limitations

Document what the module does and does not do, its data source, internal record shape, public methods, result objects, error handling, and test command.

**Done when:** Another developer can clone the repository, run tests, and understand how to use the module.

---

## 8. Testing philosophy

A test should prove one behaviour.

**Weak approach:**

- Call a method.
- Print its output.
- Assume it worked because it looks reasonable.

**Good approach:**

1. Arrange a known input.
2. Call the method.
3. Assert the exact expected result.
4. Assert that input and private state did not change.
5. Test failure cases as well as success cases.

Use deterministic test data. Do not use the live API in ordinary unit tests.

---

## 9. Security and reliability boundaries

This is a learning-grade, in-memory metadata engine, not a complete production security system.

- A closure provides encapsulation, not encryption.
- In-memory data disappears when the process exits.
- A public metadata API can change or become unavailable.
- A successful metadata fetch does not prove a channel has a working stream.
- `is_nsfw` is upstream metadata, not a complete content moderation system.
- Do not automatically trust or open URLs from external data.
- Never execute data from the dataset.
- Document a network timeout strategy if the chosen runtime supports it cleanly.

---

## 10. What you will learn

By the end of Module 02, you should be able to explain and use:

- JSON parsing
- Objects and nested arrays
- Guard clauses
- Validation
- `try/catch`
- Pure functions versus side effects
- `map()`, `filter()`, `some()`, and `includes()`
- `Set` for uniqueness
- Spread syntax and nested-data copying
- Factory functions and closures
- `fetch()`
- Promises and `async/await`
- HTTP status handling
- Unit tests and assertions
- Data normalization
- Error/result design

The goal is not to memorize method names. The goal is to understand why each method is used and what can go wrong.

---

## 11. Definition of done

Module 02 is complete only when:

- [ ] Module 01 still works.
- [ ] Module 02 has no third-party dependencies.
- [ ] The parser handles valid and invalid JSON.
- [ ] Validation follows a documented schema.
- [ ] Normalization creates a consistent internal shape.
- [ ] Duplicate handling is deterministic.
- [ ] Adult-marked records are excluded from the normal catalogue.
- [ ] Network and HTTP errors are handled.
- [ ] Returned values cannot mutate private state.
- [ ] Search and filters work.
- [ ] 40+ meaningful automated tests pass.
- [ ] Documentation and examples are complete.
- [ ] The README describes only features that are actually implemented.

---

# 12. START CODING — TASK 01

Do not implement the whole module at once. Start with the smallest piece: JSON parsing.

### File to create

`src/createChannelLoader.js`

For this task, do **not** build the factory, fetch logic, validation, or filters. Only implement `parseChannels(rawData)` and tests for it.

### Function

`parseChannels(rawData)`

### Exact requirements

1. The input must be a string.
2. Parse the string using JavaScript's JSON parser.
3. If parsing fails, return a failure result.
4. The parsed root value must be an array.
5. An empty array is valid.
6. A valid array returns a success result.
7. Do not mutate the input.
8. Follow the project's result-object convention.

### Cases to think through

| Input | Expected behaviour |
|---|---|
| `'[]'` | Success with an empty array |
| `'[{"id":"a","name":"A"}]'` | Success with one item |
| `'{"id":"a"}'` | Failure: root is not an array |
| `'null'` | Failure: root is not an array |
| `'hello'` | Failure: malformed JSON |
| `''` | Failure: malformed JSON |
| `undefined` | Failure: input is not a string |
| `[]` | Failure: input is not a string |

### Your first test checklist

- [ ] Valid empty array.
- [ ] Valid array with one object.
- [ ] Valid array with multiple objects.
- [ ] Invalid JSON text.
- [ ] Empty string.
- [ ] JSON object instead of array.
- [ ] JSON `null` instead of array.
- [ ] JavaScript array passed instead of JSON text.
- [ ] Undefined input.
- [ ] Result object has the expected keys and values.

### Before coding, understand these five questions

1. What is the difference between JSON text and a JavaScript object?
2. What does `JSON.parse()` return when the input is `'[]'`?
3. Why use `Array.isArray()` instead of relying only on `typeof`?
4. Why should malformed JSON be handled with `try/catch`?
5. Why is an empty array valid data rather than automatically an error?

### Stop point

Implement only `parseChannels(rawData)` and its tests. Run the test suite.

Then share:

- `src/createChannelLoader.js`
- Your Module 02 test file
- Terminal test output

I will review your work, explain issues, and give hints before showing a solution. We move to Task 02 only after Task 01 is understood and passing.

---

## References

- iptv-org API documentation: https://github.com/iptv-org/api
- Channel metadata JSON: https://iptv-org.github.io/api/channels.json
- Node.js documentation: https://nodejs.org/docs/latest/api/
- MDN — `JSON.parse()`: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
- MDN — `Array.isArray()`: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray