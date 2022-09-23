/*
 * Interact with the 'profiles' table and the associated tables
 * 'density', 'salinity', 'sound_speed' and 'temperature'
 *
 *
 */

const squel = require("safe-squel").useFlavour("postgres")

module.exports = {
  /*
   * Request data and profile_id from a WOD profile table
   * Valid Tables: density, salinity, sound_speed, temperature
   *
   * @param {string} table_name - Name of one of the profile tables
   * @param {int[]} profile_list - List of profile_id's
   * @return {JSON} Profile ID's and associated data
   */
  //   request_multiple_profiles: function (table_name, profile_list) {
  //     sql = this.format_profile_request(table_name)
  //     sql_exp = squel.expr()

  //     //Construct an OR argument to target the profile_id's in profile_list
  //     //and append to the existing expression
  //     for (var i = 0; i < profile_list.length; i++) {
  //       var profile = profile_list[i].profile_id
  //       sql_exp.or("profile_id = " + profile)
  //     }
  //     sql.where(sql_exp)

  //     //Query and return results
  //     return db
  //       .query(sql.toString())
  //       .then(function (data) {
  //         return data
  //       })
  //       .catch(function (err) {
  //         console.log(err)
  //       })
  //   },

  /*
   * Request data and profile_id from a WOD profile table
   * Valid Tables: density, salinity, sound_speed, temperature
   *
   * @param {string} table_name - Name of one of the profile tables
   * @param {int} profile - A single profile_id
   * @return {JSON} Profile ID and associated data
   */
  //   request_profile: function (table_name, profile) {
  //     var results = ""
  //     sql_string = format_profile_request(table_name, profile)

  //     db.query(sql_string).then((results += reply(data)))

  //     return results
  //   },

  /*
   * Create a generic query for profile data using one of the valid tables
   * as an input
   *
   * @param {string} table_name - Name fo the target table
   * @param {int} profile_id - Profile ID
   */
  format_profile_request: function (table_name, profile_id) {
    try {
      var sql = squel.select("data").from(table_name).order("profile_id")

      return sql
    } catch (error) {
      console.log(error)
    }
  },

  /*
   * Take a Start and/or End date nad construct a query parameter
   * for use in SQL
   *
   * @param {string} start_date - Earliest date for the query to include
   * @param {string} end_date - Latest date for the query to include
   * @return {string} - WHERE clause to be included in a SQL query
   */
  // parse_date_span: function (start_date, end_date) {
  //   /*Use the input dates to limit the amount of data selected*/
  //   var filter = ""

  //   //All Dataset Types
  //   if (typeof start_date === "undefined" && typeof end_date === "undefined") {
  //     console.log("No Date Provided")
  //   } else if (typeof end_date === "undefined") {
  //     /*Start date no end date*/
  //     console.log("No End Date Provided")
  //     filter += `profile_date >= '${date_format(start_date, "dd-mmm-yyyy")}'`
  //   } else if (typeof start_date === "undefined") {
  //     /*End date no start date*/
  //     console.log("No Start Date Provided")
  //     filter += `profile_date <= '${date_format(end_date, "dd-mmm-yyyy")}'`
  //   } else {
  //     console.log(start_date)
  //     filter += `profile_date BETWEEN '${date_format(
  //       start_date,
  //       "dd-mmm-yyyy"
  //     )}' AND '${date_format(end_date, "dd-mmm-yyyy")}'`
  //   }

  //   return filter
  // },

  /*
   * Determine whether the data queried will include only a certain set of instruments
   * This can refine the search to include data only required for a particular operation
   * an example is XBT.
   *
   * An empty string or string containing only 'all' will not add any filtration to the
   * query
   *
   * @param {string} datasets - Comma delimited list of desired instrument data
   * @return {string} - WHERE clause to be included in a SQL query
   *
   */
  parse_required_datasets: function (datasets) {
    /*Use the dataset types passed to construct a query filter*/
    var filter = ""

    //All Dataset Types
    if (datasets.toLowerCase() === "all" || datasets == "") {
      return filter
    }

    //One or more
    var dataset_list = datasets.split(",")
    for (var i = 0; i < dataset_list.length; i++) {
      filter += `LOWER(profile_type) =  LOWER('${dataset_list[i].replace(
        /\s/g,
        ""
      )}')`
      if (i != dataset_list.length - 1) {
        filter += " OR "
      }
    }

    console.log("FILTER: " + filter)
    return filter
  },

  /******
   * Provide only profiles that have been filtered by rank
   */
  parse_required_profile_ranks: function (profile_ranks) {
    var filter = ""

    if (profile_ranks.toLowerCase() === "all" || profile_ranks == "") {
      return filter
    }

    var ranks_list = profile_ranks.split(",")
    for (var i = 0; i < ranks_list.length; i++) {
      filter += `profile_rank = ${ranks_list[i]}`
      if (i != ranks_list.length - 1) {
        filter += " OR "
      }
    }
    console.log("Profile Rank FILTER: " + filter)
    return filter
  },

  /*
   * Provide only profiles that have been explicitly requested.
   *
   * @param {string} profiles - A comma separated list of profile id's
   * @return {string} - WHERE clause to be included in a SQL query
   */
  filter_profiles: function (profiles) {
    //All Dataset Types
    if (profiles == "") {
      return ""
    }

    //One or more
    var filter = ""
    var profile_list = profiles.split(",")
    for (var i = 0; i < profile_list.length; i++) {
      filter += `profile_id =  ${profile_list[i]}`
      if (i != profile_list.length - 1) {
        filter += " OR "
      }
    }

    return filter
  },

  /*
   *
   */
  limit_queries: function (limit, max_limit) {
    var max_limit = typeof max_limit !== "undefined" ? max_limit : 5000

    if (max_limit >= limit || limit <= 0) {
      return max_limit
    } else {
      return limit
    }
  },
}
