const BaseController = require("hmpo-form-wizard").Controller;
const axios = require("axios");

const {
  ORDNANCE: { ORDNANCE_API_URL, ORDNANCE_SURVEY_SECRET },
} = require("../../../lib/config");

class AddressSearchController extends BaseController {
  async saveValues(req, res, callback) {
    try {
      const addressPostcode = req.body["address-search"];
      const searchResults = await this.search(addressPostcode);
      super.saveValues(req, res, () => {
        req.sessionModel.set("searchResults", searchResults);
        req.sessionModel.set("addressPostcode", addressPostcode);
        callback();
      });
    } catch (err) {
      callback(err);
    }
  }

  // TODO move call to backend
  async search(postcode, scenarioIDHeader) {
    const addressResults = await axios.get(
      `${ORDNANCE_API_URL}postcode=${postcode}&key=${ORDNANCE_SURVEY_SECRET}`,
      {
        headers: {
          "x-scenario-id": scenarioIDHeader ? scenarioIDHeader : null,
        },
      }
    );

    const addresses = addressResults.data.results.map(this.formatAddress);
    return addresses;
  }

  // format the address output.
  formatAddress(address) {
    const formattedAddress = {};
    formattedAddress.label = address.DPA.ADDRESS;
    formattedAddress.buildingNumber =
      address.DPA.BUILDING_NUMBER || address.DPA.BUILDING_NAME;
    formattedAddress.streetName = address.DPA.THOROUGHFARE_NAME;
    formattedAddress.postcode = address.DPA.POSTCODE;
    formattedAddress.town = address.DPA.POST_TOWN;
    formattedAddress.text = formattedAddress.label;
    formattedAddress.value = formattedAddress.label;
    return formattedAddress;
  }
}

module.exports = AddressSearchController;
