/** @format */

const fetch = window.fetch
const EventSource = window.EventSource

const ETLENEUM = window.etleneum || 'https://etleneum.com'

export function Contract(contractId) {
  async function get(field = null) {
    let r = await fetch(
      `${ETLENEUM}/~/contract/${contractId}${field ? `/${field}` : ''}`
    )
    if (!r.ok) {
      throw new Error((await r.json()).error)
    }
    return (await r.json()).value
  }

  async function post(field = null, body = '') {
    let r = await fetch(
      `${ETLENEUM}/~/contract/${contractId}${field ? `/${field}` : ''}`,
      {method: 'POST', body}
    )
    if (!r.ok) {
      throw new Error((await r.json()).error)
    }
    return (await r.json()).value
  }

  return {
    get,
    state: (jqfilter = null) =>
      jqfilter ? post('state', jqfilter) : get('state'),
    funds: () => get('funds'),
    calls: () => get('calls'),
    events: () => get('events'),

    stream(onCall = () => {}, onError = () => {}) {
      const es = new EventSource(`${ETLENEUM}/~~~/contract/${contractId}`)

      if (onCall)
        es.addEventListener('call-made', e => {
          let data = JSON.parse(e.data)
          onCall(data.id)
        })

      if (onError)
        es.addEventListener('call-error', e => {
          let data = JSON.parse(e.data)
          if (data.kind === 'internal') {
            onError(data.id, `internal error, please notify: ${data.message}`)
          } else if (data.kind === 'runtime') {
            onError(data.id, `raised error: <pre>${data.message}</pre>`)
          }
        })

      return () => {
        es.close()
      }
    },

    async prepareCall(method, msatoshi = 0, payload = {}, session = '') {
      let r = await fetch(
        `${ETLENEUM}/~/contract/${contractId}/call?session=${session}`,
        {
          method: 'POST',
          body: JSON.stringify({
            msatoshi,
            method,
            payload
          })
        }
      )

      if (!r.ok) {
        throw new Error((await r.json()).error)
      }

      return (await r.json()).value
    }
  }
}

export async function loadCall(callid) {
  let r = await fetch(`${ETLENEUM}/~/call/${callid}`)

  if (!r.ok) {
    throw new Error((await r.json()).error)
  }

  return (await r.json()).value
}

export async function patchCall(callid, payload) {
  let r = await fetch(`${ETLENEUM}/~/call/${callid}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

  if (!r.ok) {
    throw new Error((await r.json()).error)
  }

  return (await r.json()).value
}
