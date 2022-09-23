const squel = require("safe-squel").useFlavour("postgres")
const profile = require("../sql/profile_queries")

function formatSQL(params, query) {
  var profiles = profile.filter_profiles(query.profile_id)

  var sql = squel
    .select()
    .from("profile", "p")
    .field("p.profile_id")
    .where(profiles)
    .order("profile_rank")
    .order("profile_date", false)

  console.log(sql.toString())
  return sql.toString()
}

// route schema
const schema = {
  description: "return data for selected wod data point",
  tags: ["api"],
  summary:
    "Desnity, Temperature, Salinity and Sound Speed data returned for WOD Point",
  querystring: {
    profile_id: {
      type: "string",
      description: "Enter selected WOD Data point profile id",
      default: "",
    },
  },
}

module.exports = function (fastify, opts, next) {
  fastify.route({
    method: "GET",
    url: "/ids_select_profile_data/{table}",
    schema: schema,
    handler: function (request, reply) {
      fastify.pg.connect(onConnect)

      function onConnect(err, client, release) {
        if (err) {
          request.log.error(err)
          return reply.code(500).send({ error: "Database connection error." })
        }

        client.query(
          formatSQL(request.params, request.query),
          function onResult(err, result) {
            release()
            if (err) {
              reply.send(err)
            } else {
              if (result.rows.length === 0) {
                reply.code(204).send()
              } else {
                const json = {
                  type: "FeatureCollection",
                  features: result.rows.map((el) => el.geojson),
                }
                reply.send(json)
              }
            }
          }
        )
      }
    },
  })
  next()
}

module.exports.autoPrefix = "/v1"
