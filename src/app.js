require("express");
require("express-async-errors");

const path = require("path");
const session = require("express-session");
const AWS = require("aws-sdk");
const DynamoDBStore = require("connect-dynamodb")(session);

const commonExpress = require("di-ipv-cri-common-express");

const setHeaders = commonExpress.lib.headers;
const setScenarioHeaders = commonExpress.lib.scenarioHeaders;
const setAxiosDefaults = commonExpress.lib.axios;

const { setAPIConfig, setOAuthPaths } = require("./lib/settings");
const { setGTM } = require("di-ipv-cri-common-express/src/lib/settings");
const { getGTM } = require("di-ipv-cri-common-express/src/lib/locals");

const {
  API,
  APP,
  PORT,
  SESSION_SECRET,
  SESSION_TABLE_NAME,
  SESSION_TTL,
} = require("./lib/config");

const { setup } = require("hmpo-app");

const loggerConfig = {
  console: true,
  consoleJSON: true,
  app: false,
};

AWS.config.update({
  region: "eu-west-2",
});
const dynamodb = new AWS.DynamoDB();

const dynamoDBSessionStore = new DynamoDBStore({
  client: dynamodb,
  table: SESSION_TABLE_NAME,
});

const sessionConfig = {
  cookieName: "service_session",
  cookieOptions: { maxAge: SESSION_TTL },
  secret: SESSION_SECRET,
  ...(SESSION_TABLE_NAME && { sessionStore: dynamoDBSessionStore }),
};

const helmetConfig = require("di-ipv-cri-common-express/src/lib/helmet");

const { app, router } = setup({
  config: { APP_ROOT: __dirname },
  port: PORT,
  logs: loggerConfig,
  session: sessionConfig,
  redis: SESSION_TABLE_NAME ? false : commonExpress.lib.redis(),
  helmet: helmetConfig,
  urls: {
    public: "/public",
  },
  publicDirs: ["../dist/public"],
  views: [
    path.resolve(
      path.dirname(require.resolve("di-ipv-cri-common-express")),
      "components"
    ),
    "views",
  ],
  middlewareSetupFn: (app) => {
    app.use(setHeaders);
  },
  dev: true,
});

app.get("nunjucks").addGlobal("getContext", function () {
  return {
    keys: Object.keys(this.ctx),
    ctx: this.ctx.ctx,
  };
});

setAPIConfig({
  app,
  baseUrl: API.BASE_URL,
  sessionPath: API.PATHS.SESSION,
  authorizationPath: API.PATHS.AUTHORIZATION,
});

setOAuthPaths({ app, entryPointPath: APP.PATHS.ADDRESS });

setGTM({
  app,
  id: APP.ANALYTICS.ID,
  analyticsCookieDomain: APP.ANALYTICS.COOKIE_DOMAIN,
});

router.use(getGTM);

router.use(setScenarioHeaders);
router.use(setAxiosDefaults);

router.use(commonExpress.lib.sessionComplete.checkForSessionComplete);

router.use("/oauth2", commonExpress.routes.oauth2);

router.use("/previous", require("./app/address/routes/previous"));
router.use("/", require("./app/address/routes/address"));
router.use("/summary", require("./app/address/routes/summary"));

router.use("^/$", (req, res) => {
  res.render("index");
});

router.use(commonExpress.lib.errorHandling.redirectAsErrorToCallback);
