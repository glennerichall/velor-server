import sinon from "sinon";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {tryCatchAsyncHandler} from "../core/tryCatchAsyncHandler.mjs";
import express from "express";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('Test tryCatchAsyncHandler function', () => {
    let stubHandler;

    beforeEach(() => {
        stubHandler = sinon.stub();
    });

    afterEach(() => {
        stubHandler.reset();
    });

    it('should return an array when handler is an array', async () => {
        const handlers = [ () => {}, () => {}];
        const result = tryCatchAsyncHandler(handlers, 'name');
        expect(result).to.be.an('array');
        expect(result).to.have.length(handlers.length);
    });

    it('should return the router if the handler is a router', async () => {
        const router = express.Router();
        router.publicName = 'name';
        const result = tryCatchAsyncHandler(router, 'name');
        expect(result).to.equal(router);
    });

    it('should call the next function upon exception', async () => {
        stubHandler.throws(new Error('Test Error'));
        const next = sinon.stub();
        const resultFunction = tryCatchAsyncHandler(stubHandler, 'name');
        await resultFunction('req', 'res', next);
        expect(next.callCount).to.equal(1);
    });

    it('should NOT call the next function if there are less than 3 arguments', async () => {
        stubHandler.throws(new Error('Test Error'));
        const next = sinon.stub();
        const resultFunction = tryCatchAsyncHandler(stubHandler, 'name');
        await resultFunction('req', 'res');
        expect(next.callCount).to.equal(0);
    });

    it('should name the returned function if a name is provided', () => {
        const resultFunction = tryCatchAsyncHandler(stubHandler, 'name');
        expect(resultFunction.publicName).to.equal('name');
    });

    it('should call the handler function with all arguments', async () => {
        const resultFunction = tryCatchAsyncHandler(stubHandler, 'name');
        await resultFunction('req', 'res', 'next');
        expect(stubHandler.callCount).to.equal(1);
        expect(stubHandler).calledWith('req', 'res', 'next');
    });

    it('should include the handler as a property of the returned function', () => {
        const resultFunction = tryCatchAsyncHandler(stubHandler, 'name');
        expect(resultFunction.wrappedHandler).to.equal(stubHandler);
    });
});