const BaseController = require("hmpo-form-wizard").Controller;
const AddressSearchController = require("./addressSearch");

const testData = require("../../../../test/data/testData");

const {
  API: {
    PATHS: { POSTCODE_LOOKUP },
  },
} = require("../../../lib/config");

let req;
let res;
let next;
let sandbox;
const sessionId = "session-id-123";

beforeEach(() => {
  sandbox = sinon.createSandbox();
  const setup = setupDefaultMocks();
  req = setup.req;
  res = setup.res;
  next = setup.next;
  req.session.tokenId = sessionId;
});

afterEach(() => {
  sandbox.restore();
});

describe("Address Search controller", () => {
  let addressSearch;

  beforeEach(() => {
    addressSearch = new AddressSearchController({ route: "/test" });
  });

  it("should be an instance of BaseController", () => {
    expect(addressSearch).to.be.an.instanceOf(BaseController);
  });

  it("Should call api with a postcode and save results to session", async () => {
    const testPostcode = "myPostcode";
    req.axios.get = sinon.fake.returns(testData.apiResponse);
    req.body["address-search"] = testPostcode;

    await addressSearch.saveValues(req, res, next);

    expect(next).to.have.been.calledOnce;
    expect(req.axios.get).to.have.been.calledWith(
      `${POSTCODE_LOOKUP}/${testPostcode}`,
      {
        headers: {
          session_id: sessionId,
        },
      }
    );
    expect(req.session.test.addressPostcode).to.equal(testPostcode);
    expect(req.session.test.searchResults[0].buildingNumber).to.equal("1");
    expect(req.session.test.searchResults[0].streetName).to.equal("SOME ROAD");
    expect(req.session.test.searchResults[0].postTown).to.equal("SOMEWHERE");
    expect(req.session.test.searchResults[0].postcode).to.equal("SOMEPOST");
    expect(req.session.test.searchResults[1].buildingNumber).to.equal(
      "NAMED BUILDING"
    );
    expect(req.session.test.requestIsSuccessful).to.equal(true);
  });

  it("Should not throw an error when api throws error", async () => {
    const testPostcode = "myPostcode";
    req.axios.get = sinon.fake.rejects();
    req.body["address-search"] = testPostcode;

    await addressSearch.saveValues(req, res, next);

    expect(next).to.have.been.calledOnce;
    expect(req.axios.get).to.have.been.calledWith(
      `${POSTCODE_LOOKUP}/${testPostcode}`,
      {
        headers: {
          session_id: sessionId,
        },
      }
    );
    expect(req.session.test.addressPostcode).to.equal(testPostcode);
    expect(req.session.test.requestIsSuccessful).to.equal(false);
  });
});
