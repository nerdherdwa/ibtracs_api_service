const squel = require("safe-squel").useFlavour("postgres")

module.exports = {
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
  parse_season: function (season) {
    /*Use the input dates to limit the amount of data selected*/
    var filter = ""

    //All Dataset Types
    if (season == null) {
      console.log("No Date Provided")
    } else {
      console.log(season)
      filter += `season >= ${season}`
    }

    console.log("FILTER: " + filter)
    return filter
  },

  /*
   * Take a Start and/or End Season and construct a query parameter
   * for use in SQL
   *
   * @param {string} season_start - Earliest season for the query to include
   * @param {string} season_end - Latest season for the query to include
   * @return {string} - WHERE clause to be included in a SQL query
   */
  parse_season_range: function (season_start, season_end) {
    /*Use the input dates to limit the amount of data selected*/
    var filter = ""

    //All Dataset Types
    if (season_start == null && season_end == null) {
      console.log("no start or end season provided")
    } else if (season_end == null) {
      console.log("no end season provided")
      filter += `season >= ${season_start}`
    } else if (season_start == null) {
      console.log("no start season provided")
      filter += `season <= ${season_end}`
    } else {
      console.log(`Season Start: ${season_start} and Season End: ${season_end}`)
      filter += `season BETWEEN ${season_start} AND ${season_end}`
    }

    console.log("FILTER: " + filter)
    return filter
  },

  /*
   * Take Month(s) and construct a query parameter
   * for use in SQL
   *
   * @param {string} months - list of month(s) to be filtered on
   * @return {string} - WHERE clause to be included in a SQL query
   */
  parse_months: function (months) {
    /*Use the input dates to limit the amount of data selected*/
    var filter = ""

    // months
    if (months == "") {
      console.log("no month(s) provided")
    } else {
      console.log(`months provided ${months}`)
      var month_list = months.split(",")
      for (var i = 0; i < month_list.length; i++) {
        filter += `month = ${month_list[i]}`
        if (i != month_list.length - 1) {
          filter += " OR "
        }
      }
    }

    console.log("FILTER: " + filter)
    return filter
  },

  /*
   * Take BOM Category(s) and construct a query parameter
   * for use in SQL
   *
   * @param {string} bom_cat - list of month(s) to be filtered on
   * @return {string} - WHERE clause to be included in a SQL query
   */
  parse_bom_cat: function (bom_cat) {
    /*Use the input dates to limit the amount of data selected*/
    var filter = ""

    // months
    if (bom_cat == "") {
      console.log("no BOM categories provided")
    } else {
      console.log(`bom_cat(s) provided ${bom_cat}`)
      var bom_cat_list = bom_cat.split(",")
      for (var i = 0; i < bom_cat_list.length; i++) {
        filter += `s.bom_category = ${bom_cat_list[i]}`
        if (i != bom_cat_list.length - 1) {
          filter += " OR "
        }
      }
    }

    console.log("FILTER: " + filter)
    return filter
  },

  /*
   * Take SOI Category(s) and construct a query parameter
   * for use in SQL
   *
   * @param {string} soi_cat - list of month(s) to be filtered on
   * @return {string} - WHERE clause to be included in a SQL query
   */
  parse_soi_cat: function (soi_cat) {
    /*Use the input soi_cat to limit the amount of data selected*/
    var filter = ""

    // months
    if (soi_cat == "") {
      console.log("no SOI categories provided")
    } else {
      console.log(`soi_cat(s) provided ${soi_cat}`)
      var soi_cat_list = soi_cat.split(",")
      for (var i = 0; i < soi_cat_list.length; i++) {
        filter += `s.soi_category = ${soi_cat_list[i]}`
        if (i != soi_cat_list.length - 1) {
          filter += " OR "
        }
      }
    }

    console.log("FILTER: " + filter)
    return filter
  },

  /*
   * Take SSHWS Category(s) and construct a query parameter
   * for use in SQL
   *
   * @param {string} sshws_cat - list of month(s) to be filtered on
   * @return {string} - WHERE clause to be included in a SQL query
   */
  parse_sshws_cat: function (sshws_cat) {
    /*Use the input soi_cat to limit the amount of data selected*/
    var filter = ""

    // months
    if (sshws_cat == "") {
      console.log("no SSHWS categories provided")
    } else {
      console.log(`sshws_cat(s) provided ${sshws_cat}`)
      var sshws_cat_list = sshws_cat.split(",")
      for (var i = 0; i < sshws_cat_list.length; i++) {
        filter += `s.sshws_category = ${sshws_cat_list[i]}`
        if (i != sshws_cat_list.length - 1) {
          filter += " OR "
        }
      }
    }

    console.log("FILTER: " + filter)
    return filter
  },

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
   * Provide only storms that have been explicitly requested.
   *
   * @param {string} storms - A comma separated list of profile id's
   * @return {string} - WHERE clause to be included in a SQL query
   */
  filter_profiles: function (storms) {
    //All Dataset Types
    if (storms == "") {
      return ""
    }

    //One or more
    var filter = ""
    var storm_list = storms.split(",")
    for (var i = 0; i < storm_list.length; i++) {
      filter += `sid =  '${storm_list[i]}'`
      if (i != storm_list.length - 1) {
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
