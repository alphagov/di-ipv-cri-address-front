const { Given } = require("@cucumber/cucumber");
const { RelyingPartyPage } = require("../pages");

Given(/^([A-Za-z ])+ is using the system$/, async function (name) {
  this.user = this.allUsers[name];

  const rpPage = new RelyingPartyPage(this.page);

  await rpPage.goto();
});
