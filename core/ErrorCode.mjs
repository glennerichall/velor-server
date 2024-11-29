export class ErrorCode extends Error {
    #code;

    constructor(msg, code) {
        super(msg);
        this.#code = code;
    }

    get errorCode() {
        return this.#code;
    }
}