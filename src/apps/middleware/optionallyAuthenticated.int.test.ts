// import { strict as assert } from 'assert';
// import {AuthMiddleware}, { IMockRequest, IMockResponse } from './optionallyAuthenticated';
// import useTestDb from '../../db/test';

// class MockRequest implements IMockRequest {
//     headers: { [key: string]: string };
//     requestingAuthToken?: { [key: string]: string };
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

// describe('Optionally Authenticated middleware', () => {
//     it('Proceeds if no authorization header', done => {
//         useTestDb(db => {
//             const request = new MockRequest();
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
//                         assert.strictEqual(request.requestingAuthToken, undefined);
//                         assert.strictEqual(request.requestingUser, undefined);
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

//     it('Proceeds if authToken not found', done => {
//         const authToken = 'authToken';
//         useTestDb(db => {
//             const request = new MockRequest({ authorization: authToken });
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
//                         assert.strictEqual(request.requestingAuthToken, undefined);
//                         assert.strictEqual(request.requestingUser, undefined);
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

//     it('Proceeds if token is not active', done => {
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
//                         assert.strictEqual(request.requestingAuthToken, undefined);
//                         assert.strictEqual(request.requestingUser, undefined);
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

//     it('Exits if token is expired', done => {
//         useTestDb(async db => {
//             const authTokenTTL = 1000;
//             const userEmail = 'test@q-int.com';
//             await db.models.user.create({
//                 email: userEmail,
//                 password: '',
//             });
//             const authToken = await db.models.authToken.create({
//                 userEmail,
//                 lastUsed: new Date(Date.now() - authTokenTTL),
//             });
//             const request = new MockRequest({ authorization: authToken.id });
//             return promisifyMiddleware(
//                 authenticatedMiddleware({
//                     db,
//                     config: {
//                         authentication: {
//                             authTokenIdleTTL: authTokenTTL,
//                             authTokenAbsoluteTTL: authTokenTTL,
//                             passwordHashIterations: 1,
//                             credentialTokenTTL: 1000,
//                         },
//                     },
//                 })
//             )(
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
//                         assert.strictEqual(request.requestingAuthToken, undefined);
//                         assert.strictEqual(request.requestingUser, undefined);
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
//                     if (error) {
//                         done(error);
//                     } else {
//                         done();
//                     }
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
//                 phone: null,
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
