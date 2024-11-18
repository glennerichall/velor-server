import sinon from "sinon";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {chainHandlers} from "../core/chainHandlers.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('chainHandlers function', () => {
    let req, res, next, sinonSandbox;

    beforeEach(() => {
        req = {};
        res = {};
        next = sinon.fake();
        sinonSandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sinonSandbox.restore();
    });

    it('should correctly chain handlers without error', () => {
        const handlers = [
            sinon.fake((req, res, next) => next()),
            sinon.fake((req, res, next) => next()),
            sinon.fake((req, res, next) => next())
        ];

        const chained = chainHandlers(...handlers);
        chained(req, res, next);

        handlers.forEach((handler) => {
            expect(handler).to.have.been.calledOnceWithExactly(req, res, sinon.match.func);
        });
    });

    it('should correctly chain handlers and stop at handler with error', () => {
        const error = new Error('Handler error');
        const handlers = [
            sinon.fake((req, res, next) => next(error)),
            sinon.fake((err, req, res, next) => next(err)),
            sinon.fake((req, res, next) => next())
        ];

        const chained = chainHandlers(...handlers);
        chained(req, res, next);

        expect(handlers[0]).to.have.been.calledOnce;
        expect(handlers[1]).to.have.been.calledOnceWithExactly(error, req, res, sinon.match.func);
        expect(handlers[2]).not.to.have.been.called;
    });

    it('should correctly handle handler with four arguments without error', () => {
        const handlers = [
            sinon.fake((err, req, res, next) => next(err))
        ];

        const chained = chainHandlers(...handlers);
        chained(req, res, next);

        expect(handlers[0]).not.to.have.been.called;
    });

    it('should correctly handle handler with three arguments with error', () => {
        const error = new Error('Handler error');
        const handlers = [
            sinon.fake((req, res, next) => next(error))
        ];

        const chained = chainHandlers(...handlers);
        chained(req, res, next);

        expect(handlers[0]).to.have.been.calledOnceWithExactly(req, res, sinon.match.func);
    });
});