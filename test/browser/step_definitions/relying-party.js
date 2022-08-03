const { Given, When, Then } = require("@cucumber/cucumber");

const { RelyingPartyPage } = require("../pages");
const { expect } = require("chai");

// When(/^they (?:have )?start(?:ed)? the KBV journey$/, async function () {});

Then(/^they (?:should be|have been) redirected as a success$/, function () {
  const rpPage = new RelyingPartyPage(this.page);

  expect(rpPage.isRelyingPartyServer()).to.be.true;

  expect(rpPage.hasSuccessQueryParams()).to.be.true;
});

Then(
  /^they (?:should be|have been) redirected as (?:a|an)( access_denied)* error$/,
  function (code) {
    const rpPage = new RelyingPartyPage(this.page);

    expect(rpPage.isRelyingPartyServer()).to.be.true;

    expect(rpPage.hasErrorQueryParams(code)).to.be.true;
  }
);

Then(/^the error should be (.*)$/, function (error_code) {
  const rpPage = new RelyingPartyPage(this.page);

  expect(rpPage.isRelyingPartyServer()).to.be.true;

  expect(rpPage.isErrorCode(error_code)).to.be.true;
});

When(/^they return to a previous page$/, async function () {
  const rpPage = new RelyingPartyPage(this.page);

  await rpPage.page.goBack();
});
