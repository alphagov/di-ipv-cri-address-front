const address = require("../../controllers/address/manual");
const search = require("../../controllers/address/search");
const results = require("../../controllers/address/results");

module.exports = {
  "/": {
    entryPoint: true,
    skip: true,
    next: "search",
  },
  "/search": {
    controller: search,
    fields: ["addressSearch"],
    entryPoint: true,
    next: [
      {
        field: "requestIsSuccessful",
        op: "===",
        value: true,
        next: "/previous/results",
      },
      "/previous/problem",
    ],
  },
  "/problem": {
    fields: ["addressBreak"],
    next: [
      {
        field: "addressBreak",
        value: "continue",
        next: "/previous/address",
      },
      "/previous/search",
    ],
  },
  "/results": {
    controller: results,
    fields: ["addressResults"],
    next: "/previous/address",
  },
  "/address": {
    controller: address,
    editable: true,
    continueOnEdit: true,
    prereqs: ["/search"],
    fields: [
      "addressFlatNumber",
      "addressHouseNumber",
      "addressHouseName",
      "addressStreetName",
      "addressLocality",
    ],
    next: "/summary/confirm",
  },
};
