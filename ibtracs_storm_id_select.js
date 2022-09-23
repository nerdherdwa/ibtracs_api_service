const squel = require("safe-squel").useFlavour("postgres")
const storm = require("./sql/storm_queries")

function formatSQL(params, query) {
  var storms = storm.filter_profiles(query.sid)

  var sql = squel
    .select()
    .from("storms", "s")
    .field("s.sid")
    .field("s.gid")
    .field(`ST_Transform(geom, 4326) as geom`)
    .field("s.season")
    .field("s.name")
    .where(storms)
    .order("s.iso_time", false)

  console.log(sql.toString())
  return sql.toString()
}

// route schema
const schema = {
  description: "return all IBTrAC storm points for SID.",
  tags: ["api"],
  summary: "api takes a selected SID and returns all points with the same SID",
  querystring: {
    sid: {
      type: "string",
      description: "enter selected IBTrACS SID (storm id)",
      default: "",
    },
  },
}

module.exports = function (fastify, opts, next) {
  fastify.route({
    method: "GET",
    url: "/ibtracs_storm_id_select/v1/{table}",
    schema: schema,
    handler: function (request, reply) {
      fastify.pg.connect(onConnect)

      function onConnect(err, client, release) {
        if (err) {
          request.log.error(err)
          return reply.code(500).send({ error: "Database connection error." })
        }

        client.query(
          formatSQL(sql(request.params, request.query)),
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
