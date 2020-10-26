const Nodehun = require('nodehun')
const fs = require('fs')
const path = require('path')

const availableDictionaries = require('./dictionaries.json')

const hunspellCache = {}

const getDictionary = (language) => {
  const base = require.resolve(`dictionary-${language.toLowerCase()}`)
  return {
    dic: fs.readFileSync(path.join(base, '../index.dic'), 'utf-8'),
    aff: fs.readFileSync(path.join(base, '../index.aff'), 'utf-8')
  }
}

async function getSpellchecker (language) {
  let dictionary
  let nodehun = hunspellCache[language]
  if (!nodehun) {
    try {
      dictionary = hunspellCache[language] || await getDictionary(language)
    } catch (e) {
      console.error(e)
      return
    }
    nodehun = new Nodehun(Buffer.from(dictionary.aff), Buffer.from(dictionary.dic))
    hunspellCache[language] = nodehun
  }
  return nodehun
}

async function spellcheck (text, language) {
  const words = text.split(new RegExp(/\s+/))
  const spellchecker = await getSpellchecker(language)
  const results = []
  for (let index = 0; index < words.length; index++) {
    const word = words[index]
    const isCorrect = await spellchecker.spell(word)
    const result = {
      word,
      spellcheck: isCorrect
    }
    if (!isCorrect) {
      const suggestions = await spellchecker.suggest(word)
      result.suggestions = suggestions
    }
    results.push(result)
  }

  return results
}

/**
 *
 * @returns {Promise<String[]>}
 */
async function getLanguages () {
  return availableDictionaries
}

module.exports = { spellcheck, getLanguages }
