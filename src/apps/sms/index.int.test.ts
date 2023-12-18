// import { strict as assert } from 'assert';
// import sinon from 'sinon';
// import sms from '.';
// import useTestDb from '../db/test';
// import initTestWs from '../ws/test';
// import testSms from '../util/sms/test';
// import queueGroupInteractor, { CreateQueueGroupSuccess } from '../interactor/queueGroup';
// import queueInteractor, { CreateSuccess as CreateQueueSuccess } from '../interactor/queueGroup/queue';
// import queueCustomerInteractor from '../interactor/queueGroup/queue/customer';
// import ShortUrl from '../entity/shortUrl';

// describe('SMS', () => {
//     afterEach(() => {
//         sinon.restore();
//     });

//     describe('Enqueue', () => {
//         describe('Fails', () => {
//             it('Does nothing if queue not found', async () => {
//                 await useTestDb(async db => {
//                     const queueId = 'queueId';
//                     const sender = '+15005550007';
//                     const testSmsContext = testSms.init();
//                     const smsDependency = testSms.makeDependency(testSmsContext);
//                     const dependencies = { db, sms: smsDependency };
//                     sms.init(dependencies);

//                     await smsDependency.receiveMessage(queueId, sender, 'messageId');
//                     const sentMessages = testSms.getSentMessages(testSmsContext);
//                     assert.strictEqual(sentMessages.length, 0);
//                 });
//             });
//         });

//         describe('Success', () => {
//             it('Creates customer', async () => {
//                 await useTestDb(async db => {
//                     const ownerEmail = 'test@q-int.com';
//                     const ownerPhone = '+972000000000';
//                     const queueName = 'queueName';
//                     const sender = '+15005550007';
//                     const testSmsContext = testSms.init();
//                     const smsDependency = testSms.makeDependency(testSmsContext);
//                     const dependencies = { db, sms: smsDependency };
//                     sms.init(dependencies);

//                     await db.models.user.create({
//                         email: ownerEmail,
//                         password: 'password',
//                     });
//                     const queueGroupId = (
//                         (await queueGroupInteractor.createQueueGroup(
//                             'queueGroupName',
//                             ownerEmail,
//                             ownerPhone,
//                             dependencies
//                         )) as CreateQueueGroupSuccess
//                     ).data;
//                     const queueId = (
//                         (await queueInteractor.create(
//                             queueName,
//                             queueGroupId,
//                             ownerEmail,
//                             dependencies
//                         )) as CreateQueueSuccess
//                     ).data;

//                     await smsDependency.receiveMessage(queueId, sender, 'messageId');
//                     const customer = await dependencies.db.models.customer.findOne();
//                     assert.ok(customer);
//                     assert.strictEqual(customer.phone, sender);
//                 });
//             });

//             it('Greets by name if exists', async () => {
//                 await useTestDb(async db => {
//                     const ownerEmail = 'test@q-int.com';
//                     const queueGroupName = 'queueGroupName';
//                     const queueName = 'queueName';
//                     const sender = '+15005550007';
//                     const ownerPhone = '+972000000000';
//                     const senderName = 'senderName';
//                     const testSmsContext = testSms.init();
//                     const smsDependency = testSms.makeDependency(testSmsContext);
//                     const dependencies = { db, sms: smsDependency };
//                     sms.init(dependencies);
//                     const shortLinkComponent = 'short';
//                     sinon.stub(ShortUrl, 'create').resolves(shortLinkComponent);

//                     await db.models.user.create({
//                         email: ownerEmail,
//                         password: 'password',
//                     });
//                     const queueGroupId = (
//                         (await queueGroupInteractor.createQueueGroup(
//                             queueGroupName,
//                             ownerEmail,
//                             ownerPhone,
//                             dependencies
//                         )) as CreateQueueGroupSuccess
//                     ).data;
//                     const queueId = (
//                         (await queueInteractor.create(
//                             queueName,
//                             queueGroupId,
//                             ownerEmail,
//                             dependencies
//                         )) as CreateQueueSuccess
//                     ).data;
//                     await db.models.customer.create({
//                         name: senderName,
//                         phone: sender,
//                     });

//                     await smsDependency.receiveMessage(queueId, sender, 'messageId');
//                     const queueCustomer = await dependencies.db.models.queueCustomer.findOne();
//                     const link = 'http://localhost:8080/#/s/' + shortLinkComponent;
//                     const sentMessages = testSms.getSentMessages(testSmsContext);
//                     assert.strictEqual(sentMessages.length, 1);
//                     assert.strictEqual(sentMessages[0].to, sender);
//                     assert.strictEqual(
//                         sentMessages[0].body,
//                         [
//                             `היי ${senderName} 👋, נרשמת לתור ${queueName} ${queueGroupName} בהצלחה!`,
//                             `מספרך הוא ${String(queueCustomer.number)}, לפניך יש 0 אנשים.`,
//                             `נקרא לך כשתורך יגיע ☺️`,
//                             `קישור לתור: ${link}`,
//                         ].join('\n')
//                     );
//                 });
//             });

//             it('Counts customer before', async () => {
//                 await useTestDb(async db => {
//                     const ownerEmail = 'test@q-int.com';
//                     const queueGroupName = 'queueGroupName';
//                     const queueName = 'queueName';
//                     const sender = '+15005550007';
//                     const senderName = 'senderName';
//                     const ownerPhone = '+972000000000';
//                     const customerId = '42';
//                     const ws = initTestWs();
//                     const testSmsContext = testSms.init();
//                     const smsDependency = testSms.makeDependency(testSmsContext);
//                     const dependencies = { db, sms: smsDependency };
//                     sms.init(dependencies);
//                     const shortLinkComponent = 'short';
//                     sinon.stub(ShortUrl, 'create').resolves(shortLinkComponent);

//                     await db.models.user.create({
//                         email: ownerEmail,
//                         password: 'password',
//                     });
//                     const queueGroupId = (
//                         (await queueGroupInteractor.createQueueGroup(
//                             queueGroupName,
//                             ownerEmail,
//                             ownerPhone,
//                             dependencies
//                         )) as CreateQueueGroupSuccess
//                     ).data;
//                     const queueId = (
//                         (await queueInteractor.create(
//                             queueName,
//                             queueGroupId,
//                             ownerEmail,
//                             dependencies
//                         )) as CreateQueueSuccess
//                     ).data;
//                     await db.models.customer.create({
//                         name: senderName,
//                         phone: sender,
//                         id: customerId,
//                     });
//                     await queueCustomerInteractor.enqueue(
//                         queueId,
//                         {
//                             name: '',
//                             phone: '',
//                         },
//                         { notifyUsingSms: false },
//                         { db, ws }
//                     );

//                     await smsDependency.receiveMessage(queueId, sender, 'messageId');
//                     const queueCustomer = await dependencies.db.models.queueCustomer.findOne({
//                         order: [['createdAt', 'DESC']],
//                     });
//                     const link = 'http://localhost:8080/#/s/' + shortLinkComponent;
//                     const sentMessages = testSms.getSentMessages(testSmsContext);
//                     assert.strictEqual(sentMessages.length, 1);
//                     assert.strictEqual(sentMessages[0].to, sender);
//                     assert.strictEqual(
//                         sentMessages[0].body,
//                         [
//                             `היי ${senderName} 👋, נרשמת לתור ${queueName} ${queueGroupName} בהצלחה!`,
//                             `מספרך הוא ${String(queueCustomer.number)}, לפניך יש 1 אנשים.`,
//                             `נקרא לך כשתורך יגיע ☺️`,
//                             `קישור לתור: ${link}`,
//                         ].join('\n')
//                     );
//                 });
//             });

//             it('Counts customers before', async () => {
//                 await useTestDb(async db => {
//                     const ownerEmail = 'test@q-int.com';
//                     const queueGroupName = 'queueGroupName';
//                     const queueName = 'queueName';
//                     const ownerPhone = '+972000000000';
//                     const sender = '+15005550007';
//                     const ws = initTestWs();
//                     const testSmsContext = testSms.init();
//                     const smsDependency = testSms.makeDependency(testSmsContext);
//                     const dependencies = { db, sms: smsDependency };
//                     sms.init(dependencies);
//                     const shortLinkComponent = 'short';
//                     sinon.stub(ShortUrl, 'create').resolves(shortLinkComponent);

//                     await db.models.user.create({
//                         email: ownerEmail,
//                         password: 'password',
//                     });
//                     const queueGroupId = (
//                         (await queueGroupInteractor.createQueueGroup(
//                             queueGroupName,
//                             ownerEmail,
//                             ownerPhone,
//                             dependencies
//                         )) as CreateQueueGroupSuccess
//                     ).data;
//                     const queueId = (
//                         (await queueInteractor.create(
//                             queueName,
//                             queueGroupId,
//                             ownerEmail,
//                             dependencies
//                         )) as CreateQueueSuccess
//                     ).data;
//                     await queueCustomerInteractor.enqueue(
//                         queueId,
//                         {
//                             name: '',
//                             phone: '',
//                         },
//                         { notifyUsingSms: false },
//                         { db, ws }
//                     );
//                     await queueCustomerInteractor.enqueue(
//                         queueId,
//                         {
//                             name: '',
//                             phone: '',
//                         },
//                         { notifyUsingSms: false },
//                         { db, ws }
//                     );

//                     await smsDependency.receiveMessage(queueId, sender, 'messageId');
//                     const queueCustomer = await dependencies.db.models.queueCustomer.findOne({
//                         order: [['createdAt', 'DESC']],
//                     });
//                     const link = 'http://localhost:8080/#/s/' + shortLinkComponent;
//                     const sentMessages = testSms.getSentMessages(testSmsContext);
//                     assert.strictEqual(sentMessages.length, 1);
//                     assert.strictEqual(sentMessages[0].to, sender);
//                     assert.strictEqual(
//                         sentMessages[0].body,
//                         [
//                             `היי  👋, נרשמת לתור ${queueName} ${queueGroupName} בהצלחה!`,
//                             `מספרך הוא ${String(queueCustomer.number)}, לפניך יש 2 אנשים.`,
//                             `נקרא לך כשתורך יגיע ☺️`,
//                             `קישור לתור: ${link}`,
//                         ].join('\n')
//                     );
//                 });
//             });

//             it('Handles body with trailing space', async () => {
//                 const queueId = '42';
//                 const testSmsContext = testSms.init();
//                 const smsDependency = testSms.makeDependency(testSmsContext);
//                 const enqueueStub = sinon.stub(queueCustomerInteractor, 'enqueue');
//                 sms.init({ sms: smsDependency });

//                 await smsDependency.receiveMessage(queueId + ' ', '+15005550007', 'messageId');

//                 assert.strictEqual(enqueueStub.called, true);
//                 assert.strictEqual(enqueueStub.args[0][0], queueId);
//             });
//         });
//     });
// });
