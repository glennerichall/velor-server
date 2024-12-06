// convert a Buffer received from a websocket in nodejs back to an ArrayBuffer
export function fromWsData(data) {
    return data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength
    );
}