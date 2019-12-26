/** @format */

const fetch = window.fetch
const EventSource = window.EventSource
const localStorage = window.localStorage

const ETLENEUM = window.etleneum || 'https://etleneum.com'

export function Account() {
  let session = localStorage.getItem('etleneum:session') || sessionKey()
  localStorage.setItem('etleneum:session', session)

  const initial = {
    id: null,
    lnurl: {},
    balance: 0
  }

  var es
  var account = {...initial, session}
  var subscribers = []

  function changed() {
    for (let i = 0; i < subscribers.length; i++) {
      subscribers[i](account)
    }
  }

  account.subscribe = function(run, invalidate = () => {}) {
    subscribers.push(run)
    startEventSource()

    return () => {
      let index = subscribers.indexOf(run)
      if (index !== -1) {
        subscribers.splice(index, 1)
      }
      if (subscribers.length === 0) {
        es.close()
      }
    }
  }

  account.refresh = function() {
    fetch(`${ETLENEUM}/~/refresh?session=${session}`)
  }

  account.reset = function() {
    session = sessionKey()
    localStorage.setItem('etleneum:session', session)

    account.lnurl = initial.lnurl
    account.id = initial.id
    account.balance = initial.balance
    account.session = session
    changed()

    if (es) {
      es.close()
    }

    startEventSource()
  }

  function startEventSource() {
    es = new EventSource(
      `${ETLENEUM}/~~~/session?src=etleneum-client&session=${session}`
    )
    es.addEventListener('lnurls', e => {
      let data = JSON.parse(e.data)
      account.lnurl = data
      changed()
    })
    es.addEventListener('auth', e => {
      let data = JSON.parse(e.data)
      account.id = data.account
      account.balance = data.balance
      changed()
    })
    es.addEventListener('withdraw', e => {
      let data = JSON.parse(e.data)
      account.balance = data.new_balance
      changed()
    })
  }

  return account
}

function sessionKey() {
  var result = ''
  var characters = '0123456789abcdef'
  for (var i = 0; i < 64; i++) {
    result += characters.charAt(Math.floor(Math.random() * 16))
  }
  return result
}
