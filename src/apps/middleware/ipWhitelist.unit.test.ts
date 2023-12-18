import ipWhitelist, { IMockRequest, IMockResponse } from './ipWhitelist';

const createRequest = (xForwardedFor: string | string[], remoteAddress: string): IMockRequest => ({
    headers: {
        'x-forwarded-for': xForwardedFor,
    },
    socket: {
        remoteAddress: remoteAddress,
    },
});

function createResponse(onSend: (status: number) => void): IMockResponse {
    class Response implements IMockResponse {
        _status: number;

        constructor() {
            this._status = NaN;
        }

        status(val: number): Response {
            this._status = val;
            return this;
        }

        send(): void {
            onSend(this._status);
        }
    }
    return new Response();
}

describe('ipWhitelist middleware', () => {
    it('Blocks if xForwardedFor and remoteAddress empty', done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest(null, null),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    new Error('Responded with wrong status');
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it("Blocks if xForwardedFor isn't equal and remoteAddress empty", done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest('::1', null),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it("Blocks if xForwardedFor doesn't include it and remoteAddress empty", done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest(['::1'], null),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it('Blocks if xForwardedFor and remoteAddress not equal', done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest('::1', '::1'),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it("Blocks if xForwardedFor doesn't include it and remoteAddress not equal", done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest(['::1'], '::1'),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it('Allows if xForwardedFor equal', done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest('127.0.0.1', null),
            createResponse(() => {
                done("Responded but shouldn't have");
            }),
            () => {
                done();
            }
        );
    });

    it('Allows if xForwardedFor includes it at index 0', done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest(['127.0.0.1'], null),
            createResponse(() => {
                done("Responded but shouldn't have");
            }),
            () => {
                done();
            }
        );
    });

    it('Blocks if xForwardedFor includes it at index != 0', done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest(['::1', '127.0.0.1'], null),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it('Allows if xForwardedFor empty and remoteAddress equal', done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest(null, '127.0.0.1'),
            createResponse(() => {
                done("Responded but shouldn't have");
            }),
            () => {
                done();
            }
        );
    });

    it('Blocks if empty whitelist and xForwardedFor and remoteAddress empty', done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest(null, null),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it("Blocks if xForwardedFor isn't equal and remoteAddress empty", done => {
        ipWhitelist(['127.0.0.1'])(
            createRequest('::1', null),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it('Blocks if empty whitelist and xForwardedFor and remoteAddress empty', done => {
        ipWhitelist([])(
            createRequest(null, null),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it('Blocks if empty whitelist and xForwardedFor is string and remoteAddress empty', done => {
        ipWhitelist([])(
            createRequest('::1', null),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it('Blocks if empty whitelist and xForwardedFor is array and remoteAddress empty', done => {
        ipWhitelist([])(
            createRequest(['::1'], null),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });

    it('Blocks if empty whitelist and xForwardedFor empty and remoteAddress exists', done => {
        ipWhitelist([])(
            createRequest(null, '::1'),
            createResponse(status => {
                if (status === 404) {
                    done();
                } else {
                    done(new Error('Responded with wrong status'));
                }
            }),
            () => {
                done(new Error('Did not block'));
            }
        );
    });
});
