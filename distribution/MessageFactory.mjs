import {getLogger} from "velor-services/application/services/services.mjs";

export class MessageFactory {
    #builder;
    
    constructor(builder) {
        this.#builder = builder;
    }

    emitEvent(event, data) {
        getLogger(this).debug(`Creating new event ${eventNames[event]}`);
        return this.#builder.newEvent(event, data);
    }

    invokeRpc(command, data) {
        return this.#builder.newCommand(command, data);
    }

    systemStatusChanged() {
        return this.emitEvent(EVENT_SYSTEM_STATUS_CHANGED);
    }

    apiKeyCreated(apiKey) {
        return this.emitEvent(EVENT_APIKEY_CREATED, {apiKey});
    }

    apiKeyDeleted(apiKey) {
        return this.emitEvent(EVENT_APIKEY_DELETED, {apiKey});
    }

    requireLogin(url) {
        return this.invokeRpc(RPC_REQUIRE_LOGIN, {url});
    }

    loggedOut() {
        return this.emitEvent(EVENT_LOGGED_OUT);
    }

    loggedIn() {
        return this.emitEvent(EVENT_LOGGED_IN);
    }

    warning(message, duration) {
        return this.emitEvent(EVENT_NOTIFICATION_WARNING, {message, duration});
    }

    error(message, duration) {
        return this.emitEvent(EVENT_NOTIFICATION_ERROR, {message, duration});
    }

    info(message, duration) {
        return this.emitEvent(EVENT_NOTIFICATION_INFO, {message, duration});
    }

    success(message, duration) {
        return this.emitEvent(EVENT_NOTIFICATION_SUCCESS, {message, duration});
    }

    notification(message, duration, type) {
        switch (type) {
            case 'warning':
                return this.warning(message, duration);
            case 'info':
                return this.info(message, duration);
            case 'error':
                return this.error(message, duration);
            case 'success':
                return this.success(message, duration);
        }
    }

    fileCreated({bucketname, bucket}) {
        return this.emitEvent(EVENT_NEW_FILE_CREATED, {bucketname, bucket});
    }

    fileUploaded({bucketname, bucket}) {
        return this.emitEvent(EVENT_FILE_UPLOADED, {bucketname, bucket});
    }

    // filename is optional
    // uuid is optional
    fileProcessed({bucketname, bucket, status, filename, uuid}) {
        return this.emitEvent(EVENT_FILE_PROCESSED, {bucket, bucketname, status, filename, uuid});
    }

    filesAborted(files) {
        files = trim(files);
        return this.emitEvent(EVENT_PENDING_FILE_ABORTED, {files});
    }

    filesDeleted(files) {
        files = trim(files);
        return this.emitEvent(EVENT_FILE_REMOVED, {files});
    }

    filesPurged(files) {
        files = trim(files);
        return this.emitEvent(EVENT_FILES_PURGED, {files});
    }

    preferencesChanged(name) {
        return this.emitEvent(EVENT_PREFERENCES_CHANGED, {name});
    }

    sendWsId(wsId) {
        return this.emitEvent(EVENT_WS_CONNECTION, {wsId});
    }

    readStream(type, data, streamId) {
        return this.invokeRpc(RPC_REQUEST_STREAM, {type, data, streamId});
    }

    requestDone(id, url, status) {
        return this.emitEvent(EVENT_FETCH_DONE, {id, url, status});
    }

}