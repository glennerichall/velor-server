import sinon from "sinon";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {createRouterBuilder} from "../core/createRouterBuilder.mjs";
import {identOp} from "velor-utils/utils/functional.mjs";
import {isRouter} from "../core/isRouter.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('createRouterBuilder tests', () => {
    const handler = () => {
    };

    let tryCatchAsyncHandler;

    const routerStub = {
        use: sinon.spy(),
        post: sinon.spy(),
        get: sinon.spy(),
        put: sinon.spy(),
        delete: sinon.spy(),
        options: sinon.spy(),
        all: sinon.spy(),
        route: sinon.spy(),
    };

    const configuration = [
        {use: handler},
        {path: '/test-path', get: handler},
        {path: '/post-path', post: handler},
        {path: '/put-path', put: handler},
        {path: '/delete-path', delete: handler},
        {options: handler},
    ];

    let builder;

    beforeEach(() => {
        tryCatchAsyncHandler = identOp;
        const newRouter = () => routerStub;
        builder = createRouterBuilder({
            newRouter,
            tryCatchAsyncHandler
        });
    });

    afterEach(() => {
        sinon.reset();
    });

    it('should properly configure routes', () => {
        builder.configure(configuration);
        expect(routerStub.use).calledWith(handler)
        expect(routerStub.get).calledWith('/test-path', handler)
        expect(routerStub.post).calledWith('/post-path', handler);
        expect(routerStub.put).calledWith('/put-path', handler);
        expect(routerStub.delete).calledWith('/delete-path', handler);
        expect(routerStub.options).calledWith(handler);
    });


    it('done() should return a router', () => {
        builder.configure(configuration);
        const router = builder.done();
        expect(router).to.equal(routerStub);
    });

    it('should configure subroutes', () => {
        const subhandlers = [() => {
        }];
        const configWithSubRoutes = [
            {
                router: [
                    {path: "/subroute", get: subhandlers}
                ],
                path: "/mainroute"
            }
        ];

        builder.configure(configWithSubRoutes).done();
        expect(routerStub.use).calledWith('/mainroute');
        expect(routerStub.get).calledWith('/subroute', ...subhandlers);
    });

    it('should handle array of handlers', () => {
        const handlersArray = [() => {
        }, () => {
        }];
        const configWithArrayOfHandlers = [
            {path: "/path", get: handlersArray}
        ];

        builder.configure(configWithArrayOfHandlers).done();

        expect(routerStub.get.calledWith('/path', ...handlersArray)).to.be.true;
    });

    it("should call use if route is a function", () => {
        const testFunction = () => {
        };
        const configWithFunction = [testFunction];
        builder.configure(configWithFunction).done();
        expect(routerStub.use).calledWith(testFunction);
    });

    it("should not throw error if configuration is empty", () => {
        const configWithNothing = [];
        expect(() => builder.configure(configWithNothing).done()).to.not.throw();
    });

    it('should have default express router', () => {
        const router = createRouterBuilder().done();
        expect(router).to.be.a('function');
        expect(isRouter(router)).to.be.true;
    })

    it('should trap errors', async () => {
        let routerMock = {
            get(path, ...handlers) {
                this.call = handlers[0];
            },
        }

        const router = createRouterBuilder({newRouter: () => routerMock})
            .get('/toto', () => {
                throw new Error('toto');
            }).done();

        expect(router).to.eq(routerMock);

        return new Promise((resolve, reject) => {
            router.call(null, null, err => {
                try {
                    expect(err).to.be.an('Error');
                    expect(err).to.have.property('message', 'toto')
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });

    })

    it('should build from configuration 1', () => {
        let handlerGet = () => {
        };

        let handlerPost1 = () => {
        };

        let handlerPost2 = () => {
        };

        let configuration = [
            {
                name: 'A_TOTO',
                path: '/toto',
                get: handlerGet,
                post: [handlerPost1, handlerPost2],
            }
        ];

        let called = 0;

        let routerMock = {
            get(path, ...handlers) {
                expect(path).to.eq('/toto');
                expect(handlers).to.have.length(1);
                expect(handlers[0]).to.be.a('function');
                expect(handlers[0]).to.have.property('wrappedHandler', handlerGet);
                expect(handlers[0]).to.have.property('publicName', 'A_TOTO');
                called++;
            },

            post(path, ...handlers) {
                expect(path).to.eq('/toto');
                expect(handlers).to.have.length(2);
                expect(handlers[0]).to.be.a('function');
                expect(handlers[1]).to.be.a('function');
                expect(handlers[0]).to.have.property('wrappedHandler', handlerPost1);
                expect(handlers[1]).to.have.property('wrappedHandler', handlerPost2);
                expect(handlers[0]).to.have.property('publicName', 'A_TOTO');
                expect(handlers[1]).to.have.property('publicName', 'A_TOTO');
                called++;
            },
        }

        const router = createRouterBuilder({newRouter: () => routerMock})
            .configure(configuration).done();

        expect(router).to.eq(routerMock);
        expect(called).to.eq(2);
    })

    it('should build from configuration 2', () => {
        let handlerGet1 = () => {
        };

        let handlerGet2 = () => {
        };


        let configuration = [
            {
                name: 'A_TOTO1',
                path: '/toto1',
                get: handlerGet1,
            },
            {
                name: 'A_TOTO2',
                path: '/toto2',
                get: handlerGet2,
            }
        ];

        let called = 0;

        let routerMock = {
            get(path, ...handlers) {
                if (called === 0) {
                    expect(path).to.eq('/toto1');
                    expect(handlers).to.have.length(1);
                    expect(handlers[0]).to.be.a('function');
                    expect(handlers[0]).to.have.property('wrappedHandler', handlerGet1);
                    expect(handlers[0]).to.have.property('publicName', 'A_TOTO1');
                } else if (called === 1) {
                    expect(path).to.eq('/toto2');
                    expect(handlers).to.have.length(1);
                    expect(handlers[0]).to.be.a('function');
                    expect(handlers[0]).to.have.property('wrappedHandler', handlerGet2);
                    expect(handlers[0]).to.have.property('publicName', 'A_TOTO2');
                } else {
                    throw new Error();
                }
                called++;
            },
        }

        const router = createRouterBuilder({newRouter: () => routerMock})
            .configure(configuration).done();

        expect(router).to.eq(routerMock);
        expect(called).to.eq(2);
    })

    it('should build from configuration 3', () => {
        let handlerGet1 = () => {
        };

        let handlerGet2 = () => {
        };

        let handlerGet3 = () => {
        };

        let called = 0;
        let used = false;

        let routerMockProto = {
            // needed by function 'isRouter'
            stack: [],
            params: {},

            use(...handlers) {
                expect(handlers).to.have.length(2);
                expect(handlers[0]).to.eq('/:subrouter');
                expect(handlers[1]).to.eq(this);
                used = true;
            },

            get(path, ...handlers) {
                if (called === 0) {
                    expect(path).to.eq('/toto1');
                    expect(handlers).to.have.length(1);
                    expect(handlers[0]).to.be.a('function');
                    expect(handlers[0]).to.have.property('wrappedHandler', handlerGet1);
                    expect(handlers[0]).to.have.property('publicName', 'A_TOTO1');
                } else if (called === 1) {
                    expect(path).to.eq('/toto2');
                    expect(handlers).to.have.length(1);
                    expect(handlers[0]).to.be.a('function');
                    expect(handlers[0]).to.have.property('wrappedHandler', handlerGet2);
                    expect(handlers[0]).to.have.property('publicName', 'A_TOTO2');
                } else if (called === 2) {
                    expect(path).to.eq('/toto3');
                    expect(handlers).to.have.length(1);
                    expect(handlers[0]).to.be.a('function');
                    expect(handlers[0]).to.have.property('wrappedHandler', handlerGet3);
                    expect(handlers[0]).to.have.property('publicName', 'A_TOTO3');
                } else {
                    throw new Error();
                }
                called++;
            },
        };

        let router = function (req, res, next) {
        };
        Object.assign(router, routerMockProto);

        let configuration = [
            {
                name: 'A_TOTO1',
                path: '/toto1',
                get: handlerGet1,
            },
            {
                name: 'A_SUB_ROUTER',
                path: '/:subrouter',
                router: [
                    {
                        name: 'A_TOTO2',
                        path: '/toto2',
                        get: handlerGet2,
                    },
                    {
                        name: 'A_TOTO3',
                        path: '/toto3',
                        get: handlerGet3,
                    }
                ],
            }
        ];

        const res =  createRouterBuilder({newRouter: () => router})
            .configure(configuration).done();

        expect(res).to.eq(router);
        expect(called).to.eq(3);
        expect(used).to.be.true;
    })
});