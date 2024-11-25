import sinon from "sinon";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {Emitter} from "velor-utils/utils/Emitter.mjs";
import {EventQueue} from "../core/EventQueue.mjs";

const {
    expect,
    test,
} = setupTestContext();

test.describe('EventQueue', () => {

    let emitter;
    let queue;

    test.beforeEach(() => {
        emitter = new Emitter();
        queue = new EventQueue(emitter);
    });

    test('initialize should register listener on emitter', async () => {
        const onAnySpy = sinon.spy(emitter, 'onAny');
        queue.initialize();
        expect(onAnySpy.called).to.be.true;
    });

    test('clear event', async () => {
        queue.initialize();
        emitter.emit('testEvent', 'data1');
        emitter.emit('testEvent2', 'datae1');
        queue.clear('testEvent');

        emitter.emit('testEvent', 'data2');

        let result = await queue.waitDequeue('testEvent');
        expect(result).to.deep.equal(['data2']);

        result = await queue.waitDequeue('testEvent2');
        expect(result).to.deep.equal(['datae1']);
    });

    test('clear all ', async () => {
        queue.initialize();
        emitter.emit('testEvent1', 'data1');
        emitter.emit('testEvent2', 'data2');

        queue.clear();

        emitter.emit('testEvent1', 'data3');
        emitter.emit('testEvent2', 'data4');

        let result = await queue.waitDequeue('testEvent1');
        expect(result).to.deep.equal(['data3']);

        result = await queue.waitDequeue('testEvent2');
        expect(result).to.deep.equal(['data4']);
    });

    test('dequeue should resolve with the correct data', async () => {
        queue.initialize();
        emitter.emit('testEvent', 'data1');
        emitter.emit('testEvent', 'data2');

        let result = await queue.waitDequeue('testEvent');
        expect(result).to.deep.equal(['data1']);

        result = await queue.waitDequeue('testEvent');
        expect(result).to.deep.equal(['data2']);
    });

    test('dequeue should resolve when new event data is provided', async () => {
        queue.initialize();
        setTimeout(() => emitter.emit('testEvent', 'data'), 500);
        const result = await queue.waitDequeue('testEvent');
        expect(result).to.deep.equal(['data']);
    });

    test('should dequeue nothing if empty', ()=> {
        queue.initialize();
        expect(queue.dequeue('testEvent')).to.be.undefined;
    })
});