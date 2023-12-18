// import { strict as assert } from 'assert';
// import {AuthMiddleware}, { IMockRequest, IMockResponse } from './authenticated';
// import useTestDb from '../Config/test';

// class MockRequest implements IMockRequest {
//     headers: { [key: string]: string };
//     requestingUser?: { [key: string]: string };

//     constructor(headers?: { [key: string]: string }) {
//         this.headers = headers || {};
//     }
// }

// type SendListener = (status: number, data: any) => void;

// class MockResponse implements IMockResponse {
//     _status = NaN;
//     _data: any = null;
//     _sendListeners: Array<SendListener> = [];

//     constructor(onSend?: SendListener) {
//         if (onSend) {
//             this._sendListeners.push(onSend);
//         }
//     }

//     status(val: number) {
//         this._status = val;
//         return this;
//     }

//     send(val: any) {
//         this._data = val;
//         this._sendListeners.forEach(listener => {
//             listener(this._status, this._data);
//         });
//     }
// }

// function promisifyMiddleware(
//     middleware: (req: MockRequest, res: MockResponse, next: (error?: Error) => void) => void
// ): (req: MockRequest, res: MockResponse, next: (error?: Error) => void) => Promise<void> {
//     return (req: MockRequest, res: MockResponse, next: (error?: Error) => void) =>
//         new Promise((resolve, reject) => {
//             middleware(req, res, (error?: Error) => {
//                 next(error);
//                 if (error) {
//                     reject(error);
//                 } else {
//                     resolve();
//                 }
//             });
//         });
// }

// describe('Authenticated middleware', () => {
//     it('Exits if no authorization header', done => {
//         useTestDb(db => {
//             return promisifyMiddleware(authenticatedMiddleware({ db }))(
//                 new MockRequest(),
//                 new MockResponse((status, data) => {
//                     try {
//                         assert.strictEqual(status, 403);
//                         assert.strictEqual(data, 'Authorization header required');
//                         done();
//                     } catch (err) {
//                         done(err);
//                     }
//                 }),
//                 (error?: Error) => {
//                     if (error) {
//                         done(error);
//                     } else {
//                         done(new Error('Did not exit'));
//                     }
//                 }
//             );
//         }).catch(err => {
//             done(err);
//         });
//     });

//     it('Exits if authToken not found', done => {
//         const authToken = 'authToken';
//         useTestDb(db => {
//             return promisifyMiddleware(authenticatedMiddleware({ db }))(
//                 new MockRequest({ authorization: authToken }),
//                 new MockResponse((status, data) => {
//                     try {
//                         assert.strictEqual(status, 403);
//                         assert.strictEqual(data, 'not found');
//                         done();
//                     } catch (err) {
//                         done(err);
//                     }
//                 }),
//                 (error?: Error) => {
//                     if (error) {
//                         done(error);
//                     } else {
//                         done(new Error('Did not exit'));
//                     }
//                 }
//             );
//         }).catch(err => {
//             done(err);
//         });
//     });

//     it('Exits if token is not active', done => {
//         useTestDb(async db => {
//             const userEmail = 'test@q-int.com';
//             await db.models.user.create({
//                 email: userEmail,
//                 password: '',
//             });
//             const authToken = await db.models.authToken.create({
//                 userEmail,
//                 isActive: false,
//             });
//             return promisifyMiddleware(authenticatedMiddleware({ db }))(
//                 new MockRequest({ authorization: authToken.id }),
//                 new MockResponse((status, data) => {
//                     try {
//                         assert.strictEqual(status, 403);
//                         assert.strictEqual(data, 'inactive');
//                         done();
//                     } catch (err) {
//                         done(err);
//                     }
//                 }),
//                 (error?: Error) => {
//                     if (error) {
//                         done(error);
//                     } else {
//                         done(new Error('Did not exit'));
//                     }
//                 }
//             );
//         }).catch(err => {
//             done(err);
//         });
//     });

//     it('Exits if token is expired', done => {
//         useTestDb(async db => {
//             const userEmail = 'test@q-int.com';
//             const authTokenTTL = 1000;
//             await db.models.user.create({
//                 email: userEmail,
//                 password: '',
//             });
//             const authToken = await db.models.authToken.create({
//                 userEmail,
//                 lastUsed: new Date(Date.now() - authTokenTTL),
//             });
//             return promisifyMiddleware(
//                 authenticatedMiddleware({
//                     db,
//                     config: {
//                         authentication: {
//                             passwordHashIterations: 1,
//                             authTokenIdleTTL: authTokenTTL,
//                             authTokenAbsoluteTTL: authTokenTTL,
//                             credentialTokenTTL: 1000,
//                         },
//                     },
//                 })
//             )(
//                 new MockRequest({ authorization: authToken.id }),
//                 new MockResponse((status, data) => {
//                     try {
//                         assert.strictEqual(status, 403);
//                         assert.strictEqual(data, 'inactive');
//                         done();
//                     } catch (err) {
//                         done(err);
//                     }
//                 }),
//                 (error?: Error) => {
//                     if (error) {
//                         done(error);
//                     } else {
//                         done(new Error('Did not exit'));
//                     }
//                 }
//             );
//         }).catch(err => {
//             done(err);
//         });
//     });

//     it('Proceeds if authToken and user is good', done => {
//         useTestDb(async db => {
//             const userEmail = 'test@q-int.com';
//             await db.models.user.create({
//                 email: userEmail,
//                 password: '',
//             });
//             const authToken = await db.models.authToken.create({ userEmail });
//             return promisifyMiddleware(authenticatedMiddleware({ db }))(
//                 new MockRequest({ authorization: authToken.id }),
//                 new MockResponse((status, data) => {
//                     done(new Error(`Exited with status ${status} and data "${String(data)}"`));
//                 }),
//                 (error?: Error) => {
//                     done(error);
//                 }
//             );
//         }).catch(err => {
//             done(err);
//         });
//     });

//     it('Populates `req.requestingUser` if authToken is good', done => {
//         useTestDb(async db => {
//             const userEmail = 'test@q-int.com';
//             const user = await db.models.user.create({
//                 email: userEmail,
//                 password: '',
//             });
//             const authToken = await db.models.authToken.create({ userEmail });
//             const request = new MockRequest({ authorization: authToken.id });
//             return promisifyMiddleware(authenticatedMiddleware({ db }))(
//                 request,
//                 new MockResponse((status, data) => {
//                     done(new Error(`Exited with status ${status} and data "${String(data)}"`));
//                 }),
//                 (error?: Error) => {
//                     if (error) {
//                         done(error);
//                         return;
//                     }
//                     try {
//                         assert.deepStrictEqual(request.requestingUser, user.toJSON());
//                         done();
//                     } catch (err) {
//                         done(err);
//                     }
//                 }
//             );
//         }).catch(err => {
//             done(err);
//         });
//     });
// });
