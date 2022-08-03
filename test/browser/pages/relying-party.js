module.exports = class PlaywrightDevPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    this.startingUrl =
      "http://localhost:5010/oauth2/authorize?request=lorem&client_id=standalone";

    await this.page.goto(this.startingUrl);
  }

  async isRedirectPage() {
    const url = this.page.url();

    const isCorrectPage =
      url.startsWith("http://example.net") &&
      url.endsWith("client_id=standalone&state=sT%40t3&code=FACEFEED");

    return isCorrectPage;
  }

  isRelyingPartyServer() {
    console.log(this.page.url());
    return new URL(this.page.url()).origin === "http://example.net";
  }

  hasSuccessQueryParams() {
    const { searchParams } = new URL(this.page.url());

    return (
      searchParams.get("client_id") === "standalone" &&
      searchParams.get("state") === "sT@t3" &&
      searchParams.get("code") === "FACEFEED"
    );
  }

  hasErrorQueryParams(code = "server_error") {
    console.log(code);
    const { searchParams } = new URL(this.page.url());

    console.log(searchParams);
    console.log(searchParams.get("error") == code);
    return (
      searchParams.get("error") === code
      // &&
      // searchParams.get("error_description") === description
    );
  }

  isErrorCode(code) {
    const { searchParams } = new URL(this.page.url());

    return searchParams.get("error") && searchParams.get("error") === code;
  }
};
