import sinon from "sinon";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {isRouter} from "../core/isRouter.mjs";
import express from "express";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('isRouter function', () => {
    beforeEach(() => {
        sinon.restore();
    });

    it('should return true for valid router objects', () => {
        const routerObject = function (a, b, c) {
        };
        routerObject.stack = [];
        routerObject.params = {};
        expect(isRouter(routerObject)).to.be.true;
    });

    it('should return true for a true express router objects', () => {
        const routerObject = express.Router();
        expect(isRouter(routerObject)).to.be.true;
    });

    it('should return false for non-function', () => {
        const invalidRouterObject = {
            stack: [],
            params: {},
            length: 3,
        };
        expect(isRouter(invalidRouterObject)).to.be.false;
    });

    it('should return false for non-array stack property', () => {
        const routerObject = function (a, b, c) {
        };
        routerObject.stack = {};
        routerObject.params = {};
        expect(isRouter(routerObject)).to.be.false;
    });

    it('should return false for non-object params property', () => {
        const routerObject = function (a, b, c) {
        };
        routerObject.stack = [];
        routerObject.params = 1;
        expect(isRouter(routerObject())).to.be.false;
    });

    it('should return false for invalid length property', () => {
        const routerObject = function (a, b, c, d) {
        };
        routerObject.stack = [];
        routerObject.params = {};
        expect(isRouter(routerObject)).to.be.false;
    });
});