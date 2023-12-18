// import { strict as assert } from 'assert';
// import sinon from 'sinon';
// import notifier from '.';
// import { init as initSmsContext, makeDependency as initSms } from '../sms/test';
// import { init as initPushContext, makeDependency as initPush } from '../push/test';
// import { ExpiredOrInvalidSubscriptionError } from '../push';
// import useTestDb from '../../db/test';
// import { ICustomer } from '../../../types/customer';
// import languageUtil from '../../../web/util/language';
// import cryptoUtil from '../crypto';
// import Customer from '../../entity/customer';

// function encrypt(plainText: string) {
//     return cryptoUtil.encrypt(plainText, '................................', '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E');
// }

// describe('notifier', () => {
//     beforeEach(() => {
//         sinon.stub(languageUtil, 'initialize');
//     });

//     afterEach(() => {
//         sinon.restore();
//     });

//     describe('notify()', () => {
//         it('Throws if no customer', () =>
//             assert.rejects(() => notifier.notify(null, true, 'enqueued', '', {}, {}, false)));

//         it('Sends Push if has details', async () => {
//             await useTestDb(async db => {
//                 const pushContext = initPushContext();
//                 const push = initPush(pushContext);
//                 const sms = initSms();
//                 const dependencies = { db, sms, push };
//                 const customer = await db.models.customer.create({
//                     vapidAuth: encrypt('vapidAuth'),
//                     vapidAuthIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidEndpoint: encrypt('vapidEndpoint'),
//                     vapidEndpointIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidP256dh: encrypt('vapidP256dh'),
//                     vapidP256dhIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                 } as Partial<ICustomer>);

//                 await notifier.notify(customer, false, 'enqueued', '', {}, {}, false, dependencies);

//                 assert.strictEqual(pushContext.sentPushes.length, 1);
//             });
//         });

//         it('Handles expired Push subscription', async () => {
//             await useTestDb(async db => {
//                 const pushContext = initPushContext();
//                 const push = initPush(pushContext);
//                 const sms = initSms();
//                 const dependencies = { db, sms, push };
//                 const customer = await db.models.customer.create({
//                     vapidAuth: encrypt('vapidAuth'),
//                     vapidAuthIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidEndpoint: encrypt('vapidEndpoint'),
//                     vapidEndpointIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidP256dh: encrypt('vapidP256dh'),
//                     vapidP256dhIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                 } as Partial<ICustomer>);
//                 sinon.stub(push, 'send').rejects(new ExpiredOrInvalidSubscriptionError(''));
//                 const updateCustomerStub = sinon.stub(Customer, 'update');

//                 await notifier.notify(customer, false, 'enqueued', '', {}, {}, false, dependencies);

//                 assert.strictEqual(pushContext.sentPushes.length, 0);
//                 assert.ok(updateCustomerStub.called);
//                 assert.deepStrictEqual(updateCustomerStub.args[0][1], {
//                     vapidEndpoint: '',
//                     vapidEndpointIv: '',
//                     vapidP256dh: '',
//                     vapidP256dhIv: '',
//                     vapidAuth: '',
//                     vapidAuthIv: '',
//                 });
//             });
//         });

//         it("Dooesn't send SMS if sent Push", async () => {
//             await useTestDb(async db => {
//                 const pushContext = initPushContext();
//                 const push = initPush(pushContext);
//                 const smsContext = initSmsContext();
//                 const sms = initSms(smsContext);
//                 const dependencies = { db, sms, push };
//                 const customer = await db.models.customer.create({
//                     phone: '+15005550007',
//                     vapidAuth: encrypt('vapidAuth'),
//                     vapidAuthIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidEndpoint: encrypt('vapidEndpoint'),
//                     vapidEndpointIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidP256dh: encrypt('vapidP256dh'),
//                     vapidP256dhIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                 } as Partial<ICustomer>);

//                 await notifier.notify(customer, true, 'enqueued', '', {}, {}, false, dependencies);

//                 assert.strictEqual(pushContext.sentPushes.length, 1);
//                 assert.strictEqual(smsContext.sentMessages.length, 0);
//             });
//         });

//         it('Sends SMS if lacking Push details', async () => {
//             await useTestDb(async db => {
//                 const pushContext = initPushContext();
//                 const push = initPush(pushContext);
//                 const smsContext = initSmsContext();
//                 const sms = initSms(smsContext);
//                 const dependencies = { db, sms, push };
//                 const customer = await db.models.customer.create({ phone: '+15005550007' } as Partial<ICustomer>);

//                 await notifier.notify(customer, true, 'enqueued', '', {}, {}, false, dependencies);

//                 assert.strictEqual(pushContext.sentPushes.length, 0);
//                 assert.strictEqual(smsContext.sentMessages.length, 1);
//             });
//         });

//         it("Doesn't send SMS if lacking Push details but notifyUsingSms=false", async () => {
//             await useTestDb(async db => {
//                 const pushContext = initPushContext();
//                 const push = initPush(pushContext);
//                 const smsContext = initSmsContext();
//                 const sms = initSms(smsContext);
//                 const dependencies = { db, sms, push };
//                 const customer = await db.models.customer.create({ phone: '+15005550007' } as Partial<ICustomer>);

//                 await notifier.notify(customer, false, 'enqueued', '', {}, {}, false, dependencies);

//                 assert.strictEqual(pushContext.sentPushes.length, 0);
//                 assert.strictEqual(smsContext.sentMessages.length, 0);
//             });
//         });

//         it('Sends SMS if Push subscription is expired', async () => {
//             await useTestDb(async db => {
//                 const pushContext = initPushContext();
//                 const push = initPush(pushContext);
//                 const smsContext = initSmsContext();
//                 const sms = initSms(smsContext);
//                 const dependencies = { db, sms, push };
//                 const customer = await db.models.customer.create({
//                     phone: '+15005550007',
//                     vapidAuth: encrypt('vapidAuth'),
//                     vapidAuthIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidEndpoint: encrypt('vapidEndpoint'),
//                     vapidEndpointIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidP256dh: encrypt('vapidP256dh'),
//                     vapidP256dhIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                 } as Partial<ICustomer>);
//                 sinon.stub(push, 'send').rejects(new ExpiredOrInvalidSubscriptionError(''));

//                 await notifier.notify(customer, true, 'enqueued', '', {}, {}, false, dependencies);

//                 assert.strictEqual(pushContext.sentPushes.length, 0);
//                 assert.strictEqual(smsContext.sentMessages.length, 1);
//             });
//         });

//         it('Sends SMS if Push subscription is expired but notifyUsingSms=false', async () => {
//             await useTestDb(async db => {
//                 const pushContext = initPushContext();
//                 const push = initPush(pushContext);
//                 const smsContext = initSmsContext();
//                 const sms = initSms(smsContext);
//                 const dependencies = { db, sms, push };
//                 const customer = await db.models.customer.create({
//                     phone: '+15005550007',
//                     vapidAuth: encrypt('vapidAuth'),
//                     vapidAuthIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidEndpoint: encrypt('vapidEndpoint'),
//                     vapidEndpointIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidP256dh: encrypt('vapidP256dh'),
//                     vapidP256dhIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                 } as Partial<ICustomer>);
//                 sinon.stub(push, 'send').rejects(new ExpiredOrInvalidSubscriptionError(''));

//                 await notifier.notify(customer, false, 'enqueued', '', {}, {}, false, dependencies);

//                 assert.strictEqual(pushContext.sentPushes.length, 0);
//                 assert.strictEqual(smsContext.sentMessages.length, 0);
//             });
//         });

//         it('Sends correct parameters to Push', async () => {
//             await useTestDb(async db => {
//                 const pushContext = initPushContext();
//                 const push = initPush(pushContext);
//                 const sms = initSms();
//                 const dependencies = { db, sms, push };
//                 const vapidAuth = 'vapidAuth';
//                 const vapidEndpoint = 'vapidEndpoint';
//                 const vapidP256dh = 'vapidP256dh';
//                 const messageKey = 'enqueued';
//                 const queueGroupType = 'Bar';
//                 const interpolation = {};
//                 const data = {};
//                 const customer = await db.models.customer.create({
//                     vapidAuth: encrypt(vapidAuth),
//                     vapidAuthIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidEndpoint: encrypt(vapidEndpoint),
//                     vapidEndpointIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                     vapidP256dh: encrypt(vapidP256dh),
//                     vapidP256dhIv: '2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E',
//                 } as Partial<ICustomer>);

//                 await notifier.notify(
//                     customer,
//                     false,
//                     messageKey,
//                     queueGroupType,
//                     interpolation,
//                     data,
//                     false,
//                     dependencies
//                 );

//                 assert.strictEqual(pushContext.sentPushes.length, 1);
//                 assert.deepStrictEqual(pushContext.sentPushes[0].params, {
//                     endpoint: vapidEndpoint,
//                     keys: {
//                         auth: vapidAuth,
//                         p256dh: vapidP256dh,
//                     },
//                 });
//                 assert.deepStrictEqual(pushContext.sentPushes[0].data, {
//                     messageKey,
//                     queueGroupType,
//                     interpolation,
//                     data,
//                 });
//             });
//         });

//         it('Sends correct parameters to SMS', async () => {
//             await useTestDb(async db => {
//                 const push = initPush();
//                 const smsContext = initSmsContext();
//                 const sms = initSms(smsContext);
//                 const dependencies = { db, sms, push };
//                 const messageKey = 'enqueued';
//                 const queueGroupType = 'Bar';
//                 const interpolationKey = 'foo';
//                 const interpolationValue = 'bar';
//                 const interpolation = { [interpolationKey]: interpolationValue };
//                 const phone = '+15005550007';
//                 const customer = await db.models.customer.create({ phone } as Partial<ICustomer>);
//                 const message = 'Message';
//                 const tFunctionStub = sinon.stub().returns(message);
//                 sinon.stub(languageUtil, 'getStaticTranslationNamespace').resolves(tFunctionStub);

//                 await notifier.notify(
//                     customer,
//                     true,
//                     messageKey,
//                     queueGroupType,
//                     interpolation,
//                     {},
//                     false,
//                     dependencies
//                 );

//                 assert.ok(tFunctionStub.called);
//                 assert.strictEqual(smsContext.sentMessages.length, 1);
//                 assert.deepStrictEqual(smsContext.sentMessages[0].to, phone);
//                 assert.deepStrictEqual(smsContext.sentMessages[0].body, message);
//             });
//         });
//     });
// });
