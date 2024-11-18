import sinon from "sinon";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import express from "express";
import {getAppEndpoints} from "../core/getAppEndpoints.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('getAppEndpoints testing', () => {
    let router;

    beforeEach(() => {
        // Clear all routes before each test
        router = express.Router();
    });

    it('should return an empty array when no routes are added', () => {
        const endpoints = getAppEndpoints(router);
        expect(endpoints).to.deep.equal([]);
    });

    it('should handle basic single route', () => {
        const handler = (req, res) => res.send("ok");
        handler.publicName = "testRoute";
        router.get('/test', handler);
        const endpoints = getAppEndpoints(router);
        expect(endpoints).to.deep.equal([{
            name: "testRoute",
            path: "/test",
            methods: ["GET"],
        }]);
    });

    it('should handle multiple routes with different methods', () => {
        const handler = (req, res) => res.send("ok");
        handler.publicName = "testRoute";
        router.route('/test')
            .get(handler)
            .post(handler);
        const endpoints = getAppEndpoints(router);
        expect(endpoints).to.deep.equal([
            {
                name: "testRoute",
                path: "/test",
                methods: ["GET", "POST"],
            }]);
    });

    it('should handle nested routes', () => {
        const handler = (req, res) => res.send("ok");
        handler.publicName = "nestedRoute";
        const childRouter = express.Router();
        childRouter.get('/child', handler);
        router.use('/parent', childRouter);
        const endpoints = getAppEndpoints(router);
        expect(endpoints).to.deep.equal([{
            name: "nestedRoute",
            path: "/parent/child",
            methods: ["GET"],
        }]);
    });

    it('should handle route with parameters', () => {
        const handler = (req, res) => res.send("ok");
        handler.publicName = "paramRoute";
        router.get('/user/:id', handler);
        const endpoints = getAppEndpoints(router);
        expect(endpoints).to.deep.equal([{
            name: "paramRoute",
            path: "/user/:id",
            methods: ["GET"],
        }]);
    });

    it('should remove trailing slashes', () => {
        const handler = (req, res) => res.send("ok");
        handler.publicName = "trailingSlashRoute";
        router.get('/trailingslash/', handler);
        const endpoints = getAppEndpoints(router);
        expect(endpoints).to.deep.equal([{
            name: "trailingSlashRoute",
            path: "/trailingslash",
            methods: ["GET"],
        }]);
    });
});