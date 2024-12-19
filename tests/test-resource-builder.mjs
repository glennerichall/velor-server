import sinon from "sinon";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    ResourceBuilder
} from "../core/ResourceBuilder.mjs";
import {getInstanceBinder} from "velor-services/injection/ServicesContext.mjs";
import {s_routerBuilder} from "../application/services/serviceKeys.mjs";
import {createRouterBuilder} from "../core/RouterBuilder.mjs";
import {composeGetOne} from "../core/resources/composeGetOne.mjs";
import {composeGetMany} from "../core/resources/composeGetMany.mjs";
import {composeDeleteOne} from "../core/resources/composeDeleteOne.mjs";
import {composeCreate} from "../core/resources/composeCreate.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('ResourceBuilder and Composers', () => {
    let req, res, getDao, getQuery, mapper, daoMock;

    beforeEach(() => {
        req = { params: {}, body: {} };
        res = {
            send: sinon.spy(),
            sendStatus: sinon.spy(),
            status: sinon.stub().returns({ send: sinon.spy() })
        };
        daoMock = {
            loadOne: sinon.stub(),
            loadMany: sinon.stub(),
            delete: sinon.stub(),
            saveOne: sinon.stub()
        };
        getDao = sinon.stub().returns(daoMock);
        getQuery = sinon.stub();
        mapper = sinon.stub().returnsArg(0);
    });

    describe('composeGetOne', () => {
        it('should return 404 if item not found', async () => {
            getQuery.returns({});
            daoMock.loadOne.resolves(null);

            const handler = composeGetOne(getDao, getQuery, mapper);
            await handler(req, res);

            expect(res.sendStatus.calledWith(404)).to.be.true;
        });

        it('should send mapped item if found', async () => {
            const item = { id: 1 };
            getQuery.returns({});
            daoMock.loadOne.resolves(item);

            const handler = composeGetOne(getDao, getQuery, mapper);
            await handler(req, res);

            expect(res.send.calledWith(item)).to.be.true;
        });
    });

    describe('composeGetMany', () => {
        it('should send mapped items', async () => {
            const items = [{ id: 1 }, { id: 2 }];
            getQuery.returns({});
            daoMock.loadMany.resolves(items);

            const handler = composeGetMany(getDao, getQuery, mapper);
            await handler(req, res);

            expect(res.send.calledWith(items)).to.be.true;
        });

        it('should send an empty array if no items found', async () => {
            getQuery.returns({});
            daoMock.loadMany.resolves([]);

            const handler = composeGetMany(getDao, getQuery, mapper);
            await handler(req, res);

            expect(res.send.calledWith([])).to.be.true;
        });
    });

    describe('composeDeleteOne', () => {
        it('should delete the item and send the response', async () => {
            const item = { id: 1 };
            getQuery.returns({});
            daoMock.delete.resolves(item);

            const handler = composeDeleteOne(getDao, getQuery, mapper);
            await handler(req, res);

            expect(res.send.calledWith(item)).to.be.true;
        });
    });

    describe('composeCreate', () => {
        it('should save the item and respond with status 201', async () => {
            const item = { id: 1 };
            const data = { name: 'Test' };
            req.body = data;
            daoMock.saveOne.resolves(item);

            const handler = composeCreate(getDao, sinon.stub().returns(data), mapper);
            await handler(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.status().send.calledWith(item)).to.be.true;
        });
    });

    describe('ResourceBuilder', () => {
        let builder, routerBuilder;

        beforeEach(() => {
            routerBuilder = {
                use: sinon.spy(),
                name: sinon.stub().returnsThis(),
                get: sinon.spy(),
                post: sinon.spy(),
                delete: sinon.spy(),
                done: sinon.stub()
            };

            builder = new ResourceBuilder({
                daoProvider: getDao,
                name: 'testResource',
                getItemData: sinon.stub().returnsArg(0),
                itemQueryMapper: sinon.stub().returnsArg(0),
                itemResponseMapper: sinon.stub().returnsArg(0),
                guard: sinon.spy()
            });

            getInstanceBinder(builder)
                .setInstance(s_routerBuilder, routerBuilder);

            builder.initialize();
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should define getOne route', () => {
            builder.getOne();

            expect(routerBuilder.get.calledWith('/:item')).to.be.true;
        });

        it('should define getMany route', () => {
            builder.getMany();

            expect(routerBuilder.get.calledWith('/')).to.be.true;
        });

        it('should define delete route', () => {
            builder.delete();

            expect(routerBuilder.delete.calledWith('/:item')).to.be.true;
        });

        it('should define create route', () => {
            builder.create();

            expect(routerBuilder.post.calledWith('/')).to.be.true;
        });

        it('should define all routes using all()', () => {
            builder.all();

            expect(routerBuilder.get.calledWith('/:item')).to.be.true;
            expect(routerBuilder.get.calledWith('/')).to.be.true;
            expect(routerBuilder.delete.calledWith('/:item')).to.be.true;
            expect(routerBuilder.post.calledWith('/')).to.be.true;
        });

        it('should return the router when done is called', () => {
            routerBuilder.done.returns('router');
            const result = builder.done();

            expect(result).to.equal('router');
        });
    });
});
