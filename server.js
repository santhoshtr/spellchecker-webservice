const express = require('express')
const spellcheckerBackends = require('./backends')

const app = express()
const cors = require('cors')

const port = parseInt(process.env.PORT || '9999', 10)

app.use(express.static('public'))
app.use(express.json())
app.use(cors()) // Enable cors

// Routes

app.get('/spellcheck/:language/:word', async (req, res) => {
  const language = req.params.language
  const service = await spellcheckerBackends.getSpellchecker(language)
  res.send(await service.spellcheck(req.params.word, req.params.language))
})

app.post('/spellcheck/:language', async (req, res) => {
  const language = req.params.language
  const service = await spellcheckerBackends.getSpellchecker(language)
  res.send(await service.spellcheck(req.body.text, language))
})

app.get('/list/languages', async (req, res) => {
  res.send(await spellcheckerBackends.getLanguages())
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
