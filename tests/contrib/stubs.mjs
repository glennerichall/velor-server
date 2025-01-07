export function waitForStubCall(stub) {
    return new Promise((resolve) => {
        stub.callsFake(() => {
            resolve(); // Resolve the promise when the stub is called
        });
    });
}