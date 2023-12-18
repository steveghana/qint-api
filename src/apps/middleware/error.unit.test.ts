import { strict as assert } from 'assert';
import errorMiddleware, { MockRequest, MockResponse } from './error';

function createRequest() {
    class Request implements MockRequest {}
    return new Request();
}

function createResponse(onSend: (status: number, data: any) => void, headersSent: boolean) {
    class Response implements MockResponse {
        _status: number;
        headersSent: boolean;

        constructor() {
            this.headersSent = headersSent;
            this._status = NaN;
        }

        status(val: number): Response {
            this._status = val;
            return this;
        }

        send(data: any): void {
            this.headersSent = true;
            onSend(this._status, data);
        }
    }
    return new Response();
}

describe('Error middleware', () => {
    it("Doesn't send anything if already sent", done => {
        errorMiddleware(
            new Error('Test error'),
            createRequest(),
            createResponse(() => {
                done(new Error('Does send'));
            }, true),
            null
        );
        done();
    });

    it('Sends an error if not sent yet', done => {
        errorMiddleware(
            new Error('Test error'),
            createRequest(),
            createResponse(status => {
                try {
                    assert.strictEqual(status, 500);
                    done();
                } catch (err) {
                    done(err);
                }
            }, false),
            null
        );
    });
});
