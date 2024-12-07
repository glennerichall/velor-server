function onPong(ws) {
    ws.isAlive = true;
}

export function monitorClient(client) {
    function heartbeat() {
        clearTimeout(client.pingTimeout);

        // Use `WebSocket#terminate()`, which immediately destroys the connection,
        // instead of `WebSocket#close()`, which waits for the close timer.
        // Delay should be equal to the interval at which your server
        // sends out pings plus a conservative assumption of the latency.
        client.pingTimeout = setTimeout(() => {
            client.terminate();
        }, 30000 + 1000);
    }

    client.on('open', heartbeat);
    client.on('ping', heartbeat);
    client.on('close', function clear() {
        clearTimeout(client.pingTimeout);
    });
}

export function monitorServer(wss) {
    wss.on('connection', (ws, req) => {
        // ensure connections are alive
        ws.isAlive = true;
        ws.on('pong', ()=> onPong(ws));
    });

    // heartbeat ping
    const interval = setInterval(() => {
        wss.clients.forEach(ws => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', function close() {
        clearInterval(interval);
    });
}


