const express = require('express')
const app = express()
const cors = require('cors')
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
      return
    }
    nodehun = new Nodehun(Buffer.from(dictionary.aff), Buffer.from(dictionary.dic))
    hunspellCache[language] = nodehun
  }
  return nodehun
}

async function spellcheck (word, language) {
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
  return result
}

app.use(express.static('public'))
app.use(express.json())
app.use(cors()) // Enable cors

// Routes

app.get('/spellcheck/:language/:word', async (req, res) => {
  res.send(await spellcheck(req.params.word, req.params.language))
})

app.post('/spellcheck/:language', async (req, res) => {
  const words = req.body.text.split(' ')
  const results = []
  for (let i = 0; i < words.length; i++) {
    results.push(await spellcheck(words[i], req.params.language))
  }
  res.send(results)
})

app.get('/list/languages', (req, res) => {
  res.send(availableDictionaries)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
