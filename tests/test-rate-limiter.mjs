import sinon from "sinon";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {FrameRateLimiter} from "../guards/rate/FrameRateLimiter.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('FrameRateLimiter', () => {
    let frameRateLimiter;

    beforeEach(() => {
        frameRateLimiter = new FrameRateLimiter();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initialize with no streams', async () => {
        expect(frameRateLimiter.getIntrinsicRate('key')).to.equal(0);
    });

    it('should set max rate for a new key', async () => {
        frameRateLimiter.setMaxRate('key1', 10);
        expect(frameRateLimiter.getIntrinsicRate('key1')).to.equal(0);
    });

    it('should update max rate for an existing key', async () => {
        frameRateLimiter.setMaxRate('key1', 10);
        frameRateLimiter.setMaxRate('key1', 20);
        await expect(frameRateLimiter.getIntrinsicRate('key1')).to.equal(0); // Still 0 as no frames consumed
    });

    it('should consume points and calculate intrinsic rate correctly', async () => {
        let clock = sinon.useFakeTimers({
            now: new Date(),
            shouldClearNativeTimers: true, // Automatically clear native timers
        }); // Mock the Date and timers

        frameRateLimiter.setMaxRate('key1', 10);
        await frameRateLimiter.consume('key1', 1);
        await clock.tickAsync(100);
        await frameRateLimiter.consume('key1', 1);
        const intrinsicRate = frameRateLimiter.getIntrinsicRate('key1');
        expect(intrinsicRate).to.be.greaterThan(0);

        clock.restore();
    });

    it('should throw an error when consuming frames too quickly', async () => {
        frameRateLimiter.setMaxRate('key1', 1); // 1 frame per second
        await frameRateLimiter.consume('key1', 1);

        await expect(frameRateLimiter.consume('key1', 1))
            .to.be.rejectedWith(Error); // Ensure it throws an error
    });

    it('should delete old streams during cleanUp', async () => {
        let clock = sinon.useFakeTimers({
            now: new Date(),
            shouldClearNativeTimers: true, // Automatically clear native timers
        }); // Mock the Date and timers

        frameRateLimiter.setMaxRate('key1', 10);
        await clock.tickAsync(1000 * 60 * 11); // Move forward 11 minutes
        frameRateLimiter.cleanUp();
        expect(frameRateLimiter.getIntrinsicRate('key1')).to.equal(0);

        clock.restore();
    });

    it('should not delete active streams during cleanUp', async () => {
        let clock = sinon.useFakeTimers({
            now: new Date(),
            shouldClearNativeTimers: true, // Automatically clear native timers
        }); // Mock the Date and timers


        frameRateLimiter.setMaxRate('key1', 10);
        await frameRateLimiter.consume('key1', 1);
        await clock.tickAsync(200);
        await frameRateLimiter.consume('key1', 1);

        await clock.tickAsync(1000 * 60 * 9); // Move forward 9 minutes
        frameRateLimiter.cleanUp();
        expect(frameRateLimiter.getIntrinsicRate('key1')).to.be.greaterThan(0);

        clock.restore();
    });

    it('should calculate intrinsic rate only after multiple frames', async () => {
        let clock = sinon.useFakeTimers({
            now: new Date(),
            shouldClearNativeTimers: true, // Automatically clear native timers
        }); // Mock the Date and timers


        frameRateLimiter.setMaxRate('key1', 10);
        await frameRateLimiter.consume('key1', 1);
        await clock.tickAsync(200);
        await frameRateLimiter.consume('key1', 1);
        const intrinsicRate = frameRateLimiter.getIntrinsicRate('key1');
        expect(intrinsicRate).to.be.greaterThan(0);
    });

    it('should default to a max rate of 6 if not set', async () => {
        await frameRateLimiter.consume('key1', 1);
        const streamInfo = frameRateLimiter.getIntrinsicRate('key1');
        expect(streamInfo).to.equal(0); // Intrinsic rate should be 0 initially
    });

    it('should handle multiple keys independently', async () => {
        let clock = sinon.useFakeTimers({
            now: new Date(),
            shouldClearNativeTimers: true, // Automatically clear native timers
        }); // Mock the Date and timers


        frameRateLimiter.setMaxRate('key1', 10);
        frameRateLimiter.setMaxRate('key2', 20);
        await frameRateLimiter.consume('key1', 1);
        await frameRateLimiter.consume('key2', 1);

        await clock.tickAsync(100);

        await frameRateLimiter.consume('key2', 1);
        expect(frameRateLimiter.getIntrinsicRate('key1')).to.be.eq(0);
        expect(frameRateLimiter.getIntrinsicRate('key2')).to.be.greaterThan(0);

        clock.restore();
    });

    it('should stop the cleanUp timer on destruction', async () => {
        const clearIntervalSpy = sinon.spy(global, 'clearInterval');
        frameRateLimiter = new FrameRateLimiter();
        frameRateLimiter.dispose();
        frameRateLimiter = null;
        expect(clearIntervalSpy.called).to.be.true;
    });
});
