const { Before, BeforeAll, AfterAll, After } = require("@cucumber/cucumber");
const { chromium } = require("playwright");
const axios = require("axios");

const users = {
  "Erroring Ethem": {
    name: "Ethem E",
  },
  "Not found Nigel": {
    name: "Nigel N",
  },
  "Postcode mistmatch Peter": {
    name: "Peter P",
  },
};

BeforeAll(async function () {
  // Browsers are expensive in Playwright so only create 1
  global.browser = await chromium.launch({
    // Not headless so we can watch test runs
    headless: false,
    // Slow so we can see things happening
    slowMo: 500,
  });

  this.allUsers = users;
});

AfterAll(async function () {
  await global.browser.close();
});

// Add scenario header
Before(async function ({ pickle } = {}) {
  const tags = pickle.tags || [];
  const tag = tags.find((tag) => tag.name.startsWith("@mock-api:"));

  if (!tag) {
    return;
  }

  const header = tag?.name.substring(10);

  this.SCENARIO_ID_HEADER = header;

  await axios.get(`http://localhost:8090/__reset/${header}`);
});

// Create a new test context and page per scenario
Before(async function () {
  this.context = await global.browser.newContext({});

  if (this.SCENARIO_ID_HEADER) {
    await this.context.setExtraHTTPHeaders({
      "x-scenario-id": this.SCENARIO_ID_HEADER,
    });
  }

  this.page = await this.context.newPage();
});

// Cleanup after each scenario
After(async function () {
  await this.page.close();
  await this.context.close();
});