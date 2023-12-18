# What is this?

For most [use cases](https://en.wikipedia.org/wiki/Request%E2%80%93response) the [request-response]() nature of [HTTP](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol) is sufficient.

However, some use cases require [half duplex](<https://en.wikipedia.org/wiki/Duplex_(telecommunications)#Half_duplex>) communication, such that the [server can talk to the client](https://en.wikipedia.org/wiki/Client%E2%80%93server_model) without an open request.
For example, to notify the client that something changed, so it knows to request the up to date information.

We accomplish this through [Web Sockets](https://en.wikipedia.org/wiki/WebSocket).
