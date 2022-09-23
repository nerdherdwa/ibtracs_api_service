const AWS = require("aws-sdk")
var fs = require("fs")

module.exports = (SecretId) => {
  //configure AWS SDK
  var https = require("https")
  var certs = [
    fs.readFileSync("/usr/local/share/ca-certificates/rps/rps-ca.cer"),
  ]

  AWS.config.update({
    httpOptions: {
      agent: new https.Agent({
        rejectUnauthorized: true,
        ca: certs,
      }),
    },
  })
  const region = "ap-southeast-2"
  const client = new AWS.SecretsManager({ region })

  //   const SecretId = "dev/wod"
  return new Promise((resolve, reject) => {
    //retrieving secrets from secrets manager
    client.getSecretValue({ SecretId }, (err, data) => {
      if (err) {
        reject(err)
        console.log("error connecting to aws secrets manager")
      } else {
        //parsing the fetched data into JSON
        const secretsJSON = JSON.parse(data.SecretString)
        resolve(secretsJSON)
      }
    })
  })
}
