const path = require("path")
const fastify = require("fastify")
const aws = require("aws-sdk")
const FastifySecrets = require("fastify-secrets-aws")
const { builtinModules } = require("module")
const retrieveSecrets = require("./retrieveSecrets")
require("dotenv").config()

async function build(opts = {}) {
  const app = fastify(opts)

  // // EXIT IF POSTGRES_CONNECTION ENV VARIABLE NOT SET
  // if (!("POSTGRES_CONNECTION" in process.env)) {
  //   throw new Error("Required ENV variable POSTGRES_CONNECTION is not set. Please see README.md for more information.");
  // }
  const secret = await retrieveSecrets("dev/wod")
  const connection = `${secret.engine}://${secret.username}:${secret.password}@10.46.6.206:${secret.port}/${secret.dbname}`
  // POSTGRES CONNECTION
  app.register(require("@fastify/postgres"), {
    connectionString: connection,
  })

  // COMPRESSION
  // add x-protobuf
  app.register(require("@fastify/compress"), { customTypes: /x-protobuf$/ })

  // CACHE SETTINGS
  app.register(require("@fastify/caching"), {
    privacy: process.env.CACHE_PRIVACY || "private",
    expiresIn: process.env.CACHE_EXPIRESIN || 3600,
    serverExpiresIn: process.env.CACHE_SERVERCACHE,
  })

  // CORS
  app.register(require("@fastify/cors"))

  // OPTIONAL RATE LIMITER
  if ("RATE_MAX" in process.env) {
    app.register(import("@fastify/rate-limit"), {
      max: process.env.RATE_MAX,
      timeWindow: "1 minute",
    })
  }

  // INITIALIZE SWAGGER
  app.register(require("@fastify/swagger"), {
    exposeRoute: true,
    routePrefix: "/",
    swagger: {
      info: {
        title: "IBTrACS Postgres API Service",
        description:
          "The IBTrACS postgres API service. It takes simple requests over HTTP and returns JSON, JSONP, or protobuf (Mapbox Vector Tile) to the requester.",
      },
      schemes: ["http", "https"],
      tags: [
        {
          name: "api",
          description: "code related end-points",
        },
        {
          name: "feature",
          description: "features in common formats for direct mapping.",
        },
        {
          name: "meta",
          description: "meta information for tables and views.",
        },
      ],
    },
  })

  // ADD ROUTES
  app.register(require("@fastify/autoload"), {
    dir: path.join(__dirname, "routes"),
  })

  return app
}

module.exports = build
