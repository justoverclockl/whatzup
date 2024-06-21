<div align="center">
    <img src="https://res.cloudinary.com/dnhxygy8z/image/upload/v1718282774/whatzup/OIG2__1_-removebg-preview_vsjv61.png" title="whatzup-.js" alt="WhatzUP" width="500" />
</div>

## About
**Rewrite from Whatsapp-web.js library with TS**

**A WhatsApp API client that connects through the WhatsApp Web browser app based on whatsapp-web.js**

The library works by launching the WhatsApp Web browser application and managing it using Puppeteer to create an instance of WhatsApp Web, thereby mitigating the risk of being blocked. 
The WhatsApp API client connects through the WhatsApp Web browser app, accessing its internal functions. This grants you access to nearly all the features available on WhatsApp Web, enabling dynamic handling similar to any other Node.js application.


## Example basic configuration

```javascript

// istantiate a new client with your strategy
const client = new Client({
    authStrategy: new LocalAuth()
})

// listen to the "READY" event to know if the client is ready.
client.on('ready', (message) => {
    console.log(message)
})

// listen to the "LOADED" event to know if the page is fully loaded
client.on('loaded', (message) => {
    console.log(message)
})

// listen to "QR" event that return the qr code (you can use libraries like react-qr-code to render the full qr code)
client.on('qr', (qr) => {
    console.log(qr)
})

// listen to "authenticated" event to know if your authentication is ok
client.on('authenticated', (message) => {
    console.log(message)
})

client.on('remote_session_saved', (message) => {
    console.log(message)
})

client.on('logout', (message) => {
    console.log(message)
})

// initialize the client
client.initialize()
```
