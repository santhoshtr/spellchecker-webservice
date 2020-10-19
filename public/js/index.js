
function spellcheck (word, language) {
  document.getElementById('progress').style.display = 'block'
  return fetch(`/spellcheck/${language}/${word}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())
}

function onResult (result) {
  const statusNode = document.getElementById('status')
  const suggestionsNode = document.getElementById('suggestions')
  suggestionsNode.innerHTML = ''
  if (result.spellcheck) {
    statusNode.textContent = `✔️ ${result.word}`
  } else {
    statusNode.textContent = `❌ ${result.word}`
    result.suggestions.map((suggestion) => {
      const option = document.createElement('li')
      option.innerText = suggestion
      suggestionsNode.appendChild(option)
    })
  }
}
function onSubmit () {
  const language = document.getElementById('language').value
  const word = document.getElementById('word').value
  spellcheck(word, language).then(onResult).finally(() => {
    document.getElementById('progress').style.display = 'none'
  })
  return false
}

function getLanguages () {
  return fetch('/list/languages').then(response => response.json())
}

function onLoad () {
  document.getElementById('progress').style.display = 'none'

  const languagesNode = document.getElementById('language')
  getLanguages().then(languages => {
    languages.map((language) => {
      const option = document.createElement('option')
      option.value = language
      option.textContent = Intl.DisplayNames ? new Intl.DisplayNames(['en'], { type: 'language' }).of(language) : language
      languagesNode.appendChild(option)
    })
  })
}

window.addEventListener('load', onLoad)
