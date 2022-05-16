const BaseController = require("hmpo-form-wizard").Controller;
const AddressConfirmController = require("./addressConfirm");
const addressFactory = require("../../../../test/utils/addressFactory");
const { expect } = require("chai");

const testData = require("../../../../test/data/testData");
const {
  API: {
    PATHS: { SAVE_ADDRESS },
  },
} = require("../../../lib/config");

let req;
let res;
let next;
let sandbox;
let addresses = [];
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

describe("Address confirmation controller", () => {
  let addressConfirm;

  beforeEach(() => {
    addresses = addressFactory(2);
    req.sessionModel.set("addresses", addresses);
    addressConfirm = new AddressConfirmController({ route: "/test" });
  });

  it("should be an instance of BaseController", () => {
    expect(addressConfirm).to.be.an.instanceOf(BaseController);
  });

  describe("locals", () => {
    it("Should format the current address and previous addresses in locals", async () => {
      // factor in the address might have building name or number or both
      const formattedAddresses = addresses.map((address) => {
        let buildingNameNumber;
        if (address.buildingName && address.buildingNumber) {
          buildingNameNumber = `${address.buildingNumber} ${address.buildingName}`;
        } else {
          buildingNameNumber = address.buildingName || address.buildingNumber;
        }

        return `${buildingNameNumber}<br>${address.streetName},<br>${address.addressLocality},<br>${address.postalCode}<br>`;
      });

      const currentAddress = formattedAddresses.shift();
      const previousAddress = formattedAddresses.shift();
      const params = {
        addPreviousAddresses: true,
        isMoreInfoRequirred: true,
        currentAddressRowValue: currentAddress,
        validFromRow: String(new Date().getFullYear()),
        previousAddressRowValue: previousAddress,
      };

      addressConfirm.locals(req, res, next);
      expect(next).to.have.been.calledOnce;
      expect(next).to.have.been.calledWith(null, params);
    });
  });

  describe("saveValues", () => {
    it("Should put address to address api and redirect back to callback", async () => {
      req.axios.put = sinon.fake.resolves(testData.addressApiResponse);

      await addressConfirm.saveValues(req, res, next);
      expect(req.axios.put).to.have.been.calledWith(SAVE_ADDRESS, addresses, {
        headers: {
          session_id: sessionId,
        },
      });
      expect(req.session.test.redirect_url).to.be.equal(
        testData.addressApiResponse.data.redirect_uri
      );
      expect(req.session.test.authorization_code).to.be.equal(
        testData.addressApiResponse.data.code
      );
      expect(req.session.test.state).to.be.equal(
        testData.addressApiResponse.data.state
      );
    });

    it("Should set error state if no code is returned", async () => {
      const response = testData.addressApiResponse;
      delete response.data.code;
      req.axios.put = sinon.fake.resolves(response);

      await addressConfirm.saveValues(req, res, next);
      expect(req.session.test.error.code).to.be.equal("server_error");
      expect(req.session.test.error.error_description).to.be.equal(
        "Failed to retrieve authorization code"
      );
    });
  });

  describe("isMoreInfoRequired", () => {
    const testData = [
      {
        fakeToday: new Date(),
        yearFrom: 2020,
        expect: false,
        message: "is more than 3 months ago",
      },
      {
        fakeToday: new Date(2022, 1),
        yearFrom: 2021,
        expect: true,
        message: "is within the last 3 months",
      },
      {
        fakeToday: new Date(2022, 3, 1),
        yearFrom: 2021,
        expect: false,
        message: "is exactly 3 months ago",
      },
      {
        fakeToday: new Date(2022, 2, 31),
        yearFrom: 2021,
        expect: true,
        message: "is 1 day less than 3 months ago",
      },
      {
        fakeToday: new Date(2024, 3, 1),
        yearFrom: 2023,
        expect: false,
        message: "is exactly 3 months ago - leap year",
      },
      {
        fakeToday: new Date(2024, 2, 31),
        yearFrom: 2024,
        expect: true,
        message: "is 1 day less than 3 months ago - leap year",
      },
    ];

    testData.forEach((data) => {
      const todayMessage = data.fakeToday.toISOString().split("T")[0];
      it(`should return ${data.expect} when today is ${todayMessage} and yearFrom is ${data.yearFrom} which means residency ${data.message}`, () => {
        expect(
          addressConfirm.isMoreInfoRequired(data.yearFrom, data.fakeToday)
        ).to.equal(data.expect);
      });
    });
  });
});
