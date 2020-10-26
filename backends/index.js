const hunspellService = require('./hunspell')
const webService = require('./webapis')

/**
 *
 * @param {string} language
 * @returns {Promise<Object>}
 */
async function getSpellchecker (language) {
  const hunspellLanguages = await hunspellService.getLanguages()
  if (hunspellLanguages.includes(language)) return hunspellService
  const webServiceLanguages = await webService.getLanguages()
  if (webServiceLanguages.includes(language)) return webService
}

/**
 *
 * @returns {Promise<String[]>}
 */
async function getLanguages () {
  return [...await hunspellService.getLanguages(), ...await webService.getLanguages()].sort()
}

module.exports = { getSpellchecker, getLanguages }
