"use strict"

const build = require("./app")
// LAUNCH SERVER
const start = async () => {
  try {
    const fastify = await build({})
    await fastify.listen(
      {
        port: process.env.SERVER_PORT || 3010,
        host: process.env.SERVER_HOST || "0.0.0.0",
      },
      (err, address) => {
        if (err) {
          console.log(err)
          process.exit(1)
        }
        console.info(`Server listening on ${address}`)
      }
    )
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

start()
