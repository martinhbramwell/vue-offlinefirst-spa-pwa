/* **************

     This file is necessary for calling within a Cypress task.

*************** */

module.exports = {
  couchGetOpts: function(query) {
    return {
      url: `${process.env.CYPRESS_CH_URL}/${query}`,
      method: "GET",
      followRedirect: true,
      failOnStatusCode: true,
      headers: {
        'pragma': 'no-cache',
        'cache-control': 'no-cache'
      }
    }
  },

  couchPutOpts: function(id) {
    return {
      url: `${process.env.CYPRESS_CH_URL}/${id}`,
      method: "PUT",
      followRedirect: true,
      failOnStatusCode: true,
    }
  }
};
