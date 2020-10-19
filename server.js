const express = require('express')
const app = express()
const Nodehun = require('nodehun')
const fs = require('fs')
const path = require('path')
const availableDictionaries = require('./dictionaries.json')

const port = parseInt(process.env.PORT || '9999', 10)
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
      res.status(500).send(`Could not find dictionary for ${language}`)
      return
    }
    if (!dictionary) {
      res.status(500).send(`Could not find dictionary for ${language}`)
    }
    nodehun = new Nodehun(Buffer.from(dictionary.aff), Buffer.from(dictionary.dic))
    hunspellCache[language] = nodehun
  }
  return nodehun
}

app.use(express.static('public'))

app.get('/spellcheck/:language/:word', async (req, res) => {
  const word = req.params.word
  const language = req.params.language
  const spellchecker = await getSpellchecker(language)
  const isCorrect = await spellchecker.spell(word)
  const result = {
    word,
    spellcheck: isCorrect
  }
  if (!isCorrect) {
    const suggestions = await spellchecker.suggest(word)
    result.suggestions = suggestions
  }
  res.send(result)
})

app.get('/list/languages', (req, res) => {
  res.send(availableDictionaries)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
