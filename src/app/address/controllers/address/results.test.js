const BaseController = require("hmpo-form-wizard").Controller;
const AddressResultController = require("./results");

const testData = require("../../../../../test/data/testData");

let req;
let res;
let next;
let sandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
  const setup = setupDefaultMocks();
  req = setup.req;
  res = setup.res;
  next = setup.next;
});

afterEach(() => {
  sandbox.restore();
});

describe("Address result controller", () => {
  let addressResult;

  beforeEach(() => {
    addressResult = new AddressResultController({ route: "/test" });
  });

  it("should be an instance of BaseController", () => {
    expect(addressResult).to.be.an.instanceOf(BaseController);
  });

  it("Should set the chosen address in the session", async () => {
    const expectedResponse = testData.formattedAddressed[1];

    req.form.values.addressResults = expectedResponse.value;

    req.sessionModel.set("searchResults", testData.formattedAddressed);

    await addressResult.saveValues(req, res, next);

    expect(next).to.have.been.calledOnce;
    expect(req.session.test.address.buildingNumber).to.equal(
      expectedResponse.buildingNumber
    );

    expect(req.session.test.address.streetName).to.equal(
      expectedResponse.streetName
    );
    expect(req.session.test.address.postCode).to.equal(
      expectedResponse.postCode
    );
    expect(req.session.test.address.postTown).to.equal(
      expectedResponse.postTown
    );
  });
});
