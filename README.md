# etleneum

A browser client for the https://etleneum.com/ [HTTP API](https://etleneum.com/#/docs).

```
npm install etleneum
```

```javascript
import {Contract, Account, loadCall} from 'etleneum'

var authSession

// deal with accounts
const account = Account() // will store/get session ids on localStorage automatically
account.subscribe(({id, lnurl, balance, session}) => {
  console.log(session)
  console.log(id) // id is null if you're not authenticated
  console.log(lnurl.auth) // show this as a link and QR code so the user can login

  // after a successful login this function will be called again and now there will
  // be an id and a balance
  console.log(id, session)
  console.log(balance)
  console.log(lnurl.withdraw) // show this so the user can withdraw his balance

  authSession = session
})
account.reset() // closes the session and erases it from localStorage ~ logout
account.refresh() // causes the subscribe event to be called with updated data

// to make this account object into a svelte store do this:
// import {readable} from 'svelte/store'
// readable(account, set => account.subscribe(set))

// deal with contracts
const contract = Contract(contractId)
let state = await contract.state()
let filteredState = await contract.state('<jq filter>')
let funds = await contract.funds()
let calls = await contract.calls()

let {id, bolt11} = contract.prepareCall('method', sats, {...payload}, authSession)
// authSession is optional, only if there's an authenticated user and you want
// to prepare an authenticated call (depends on requirements of each contract).

// as soon as bolt11 is paid the call will be executed.
// listen to results of the execution:
contract.stream(callId => {
  if (callId === id) {
    console.log('our call was executed!')
  } else {
    console.log("someone else's call was executed!")
  }
}, (callId, errMsg) => {
  console.log('a call resulted in an error', callId, errMsg)
})

// load arbitrary calls -- either executed or just prepared
let {id, method, payload, msatoshi} = await loadCall(id)
```

---

Let me know if there's something wrong here.
