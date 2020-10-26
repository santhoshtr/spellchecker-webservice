const axios = require('axios')
const https = require('https')

const mlSpellcheck = async function (text) {
  const api = 'https://morph.smc.org.in/api/spellcheck'
  return axios.post(api, {
    text: text
  }, {
    httpsAgent: new https.Agent({
      // Allow self signed certificates
      rejectUnauthorized: false
    })
  })
    .then((response) => {
      const spellResults = []
      const results = response.data
      Object.keys(results).forEach((word) => {
        spellResults.push({
          word,
          spellcheck: results[word].correct,
          suggestions: results[word].suggestions
        })
      })
      return spellResults
    }).catch((error) => {
      console.error('Spellcheck error:' + error)
    })
}

const services = {
  ml: mlSpellcheck
}

async function spellcheck (word, language) {
  return await services[language](word)
}

/**
 * @returns {Promise<String[]>}
 */
async function getLanguages () {
  return Object.keys(services)
}

module.exports = { spellcheck, getLanguages }
