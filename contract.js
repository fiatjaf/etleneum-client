/** @format */

import get from 'just-safe-get'

export async function loadContract() {
  let r = await fetch(`${window.etleneum}/~/contract/${window.contract}/state`)

  if (!r.ok) {
    throw new Error((await r.json()).error)
  }

  return (await r.json()).value
}

export async function makeCall(
  method,
  satoshis,
  payload,
  {showInvoice, invoiceAt, showPasteInvoice}
) {
  if (invoiceAt) {
    let invoice = await new Promise(resolve => {
      showPasteInvoice({
        onPasted: pasted => {
          showPasteInvoice(null)
          resolve(pasted)
        },
        hide: () => showPasteInvoice(null)
      })
    })
    payload[invoiceAt] = invoice
  }

  let r = await fetch(`${window.etleneum}/~/contract/${window.contract}/call`, {
    method: 'POST',
    body: JSON.stringify({
      satoshis,
      method,
      payload
    })
  })

  if (!r.ok) {
    throw new Error((await r.json()).error)
  }

  let {id: callid, invoice} = (await r.json()).value

  return new Promise(resolve => {
    showInvoice({
      invoice,
      onPaid: async () => {
        let r = await fetch(`${window.etleneum}/~/call/${callid}`, {
          method: 'POST'
        })
        if (!r.ok) {
          throw new Error((await r.json()).error)
        }

        showInvoice(null)
        resolve((await r.json()).value)
      },
      hide: () => showInvoice(null)
    })
  })
}
