// import { strict as assert } from 'assert';
// import sinon from 'sinon';
// import customerEntityGateway from './customer';
// import useTestDb from '@/apps/Config/test';

// describe('customer Entity Gateway', () => {
//     afterEach(() => {
//         sinon.restore();
//     });

//     describe('getCustomerById()', () => {
//         it('Returns null if no customer', async () => {
//             await useTestDb(async db => {
//                 const actual = await customerEntityGateway.getCustomerById('', null, { db });
//                 assert.strictEqual(actual, null);
//             });
//         });

//         it('Returns the customer', async () => {
//             await useTestDb(async db => {
//                 const customer = await db.models.customer.create({});
//                 const actual = await customerEntityGateway.getCustomerById(customer.id, null, { db });
//                 assert.ok(actual);
//                 assert.strictEqual(actual.id, customer.id);
//             });
//         });

//         it("Doesn't return other customer", async () => {
//             await useTestDb(async db => {
//                 await db.models.customer.create({});
//                 const actual = await customerEntityGateway.getCustomerById('', null, { db });
//                 assert.strictEqual(actual, null);
//             });
//         });

//         it('Gets with transaction', async () => {
//             const transaction = {};
//             const findStub = sinon.stub();

//             await customerEntityGateway.getCustomerById('', transaction as any, {
//                 db: {
//                     models: {
//                         customer: { findByPk: findStub },
//                     },
//                 } as any,
//             });

//             assert.strictEqual(findStub.called, true);
//             assert.strictEqual(findStub.args[0][1].transaction, transaction);
//         });
//     });

//     describe('getCustomerByPhone()', () => {
//         it('Returns null if no customer', async () => {
//             await useTestDb(async db => {
//                 const actual = await customerEntityGateway.getCustomerByPhone('', null, { db });
//                 assert.strictEqual(actual, null);
//             });
//         });

//         it('Returns the customer', async () => {
//             await useTestDb(async db => {
//                 const phone = '+15005550007';
//                 await db.models.customer.create({ phone });

//                 const actual = await customerEntityGateway.getCustomerByPhone(phone, null, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual.phone, phone);
//             });
//         });

//         it("Doesn't return other customer", async () => {
//             await useTestDb(async db => {
//                 await db.models.customer.create({ phone: '+15005550007' });
//                 const actual = await customerEntityGateway.getCustomerByPhone('', null, { db });
//                 assert.strictEqual(actual, null);
//             });
//         });

//         it('Gets with transaction', async () => {
//             const transaction = {};
//             const findStub = sinon.stub();

//             await customerEntityGateway.getCustomerByPhone('', transaction as any, {
//                 db: {
//                     models: {
//                         customer: { findOne: findStub },
//                     },
//                 } as any,
//             });

//             assert.strictEqual(findStub.called, true);
//             assert.strictEqual(findStub.args[0][0].transaction, transaction);
//         });
//     });

//     describe('createCustomer()', () => {
//         it('Creates customer', async () => {
//             await useTestDb(async db => {
//                 await customerEntityGateway.createCustomer({}, null, { db });
//                 const customer = await db.models.customer.findOne();
//                 assert.ok(customer);
//             });
//         });

//         it('Creates with name', async () => {
//             await useTestDb(async db => {
//                 const name = 'name';
//                 await customerEntityGateway.createCustomer({ name }, null, { db });
//                 const customer = await db.models.customer.findOne();
//                 assert.ok(customer);
//                 assert.strictEqual(customer.name, name);
//             });
//         });

//         it('Creates with phone', async () => {
//             await useTestDb(async db => {
//                 const phone = 'phone';
//                 await customerEntityGateway.createCustomer({ phone }, null, { db });
//                 const customer = await db.models.customer.findOne();
//                 assert.ok(customer);
//                 assert.strictEqual(customer.phone, phone);
//             });
//         });

//         it('Creates with agent', async () => {
//             await useTestDb(async db => {
//                 const agent = 'Jest';
//                 await customerEntityGateway.createCustomer({ agent }, null, { db });
//                 const customer = await db.models.customer.findOne();
//                 assert.ok(customer);
//                 assert.strictEqual(customer.agent, agent);
//             });
//         });

//         it('Creates with ipAddress', async () => {
//             await useTestDb(async db => {
//                 const ipAddress = '127.0.0.1';
//                 await customerEntityGateway.createCustomer({ ipAddress }, null, { db });
//                 const customer = await db.models.customer.findOne();
//                 assert.ok(customer);
//                 assert.strictEqual(customer.ipAddress, ipAddress);
//             });
//         });

//         it('Creates with transaction', async () => {
//             const transaction = {};
//             const createStub = sinon.stub();

//             await customerEntityGateway.createCustomer({}, transaction as any, {
//                 db: {
//                     models: {
//                         customer: { create: createStub },
//                     },
//                 } as any,
//             });

//             assert.strictEqual(createStub.called, true);
//             assert.strictEqual(createStub.args[0][1].transaction, transaction);
//         });
//     });

//     describe('updateCustomer()', () => {
//         it('Does nothing if no customer', async () => {
//             await useTestDb(async db => {
//                 await customerEntityGateway.updateCustomer('', {}, null, { db });
//             });
//         });

//         it('Updates customer', async () => {
//             await useTestDb(async db => {
//                 const oldName = 'oldName';
//                 const newName = 'newName';
//                 const customer = await db.models.customer.create({ name: oldName });

//                 await customerEntityGateway.updateCustomer(customer.id, { name: newName }, null, { db });

//                 const customerAfter = await db.models.customer.findOne();
//                 assert.strictEqual(customer.name, oldName);
//                 assert.strictEqual(customerAfter.name, newName);
//             });
//         });

//         it('Updates with transaction', async () => {
//             const transaction = {};
//             const updateStub = sinon.stub();

//             await customerEntityGateway.updateCustomer('', {}, transaction as any, {
//                 db: {
//                     models: {
//                         customer: { update: updateStub },
//                     },
//                 } as any,
//             });

//             assert.strictEqual(updateStub.called, true);
//             assert.strictEqual(updateStub.args[0][1].transaction, transaction);
//         });

//         it("Doesn't update other customer", async () => {
//             await useTestDb(async db => {
//                 const oldName = 'oldName';
//                 const newName = 'newName';
//                 const customer = await db.models.customer.create({ name: oldName });

//                 await customerEntityGateway.updateCustomer('', { name: newName }, null, { db });

//                 const customerAfter = await db.models.customer.findOne();
//                 assert.strictEqual(customer.name, oldName);
//                 assert.strictEqual(customerAfter.name, oldName);
//             });
//         });
//     });

//     describe('findOrCreateCustomerByPhone()', () => {
//         describe('', () => {
//             it('Uses transaction', async () => {
//                 const transaction = {};
//                 const findOrCreateStub = sinon.stub().resolves([]);

//                 await customerEntityGateway.findOrCreateCustomerByPhone(
//                     '',
//                     {},
//                     transaction as any,
//                     {
//                         db: { models: { customer: { findOrCreate: findOrCreateStub } } },
//                     } as any
//                 );

//                 assert.ok(findOrCreateStub.called);
//                 assert.strictEqual(findOrCreateStub.args[0][0].transaction, transaction);
//             });
//         });

//         describe("If doesn't exist", () => {
//             it('Creates customer', async () => {
//                 await useTestDb(async db => {
//                     const name = 'name';
//                     await customerEntityGateway.findOrCreateCustomerByPhone('', { name }, null, { db });

//                     const customersAfter = await db.models.customer.findAll();
//                     assert.strictEqual(customersAfter.length, 1);
//                     assert.strictEqual(customersAfter[0].name, name);
//                 });
//             });

//             it('Returns created customer', async () => {
//                 await useTestDb(async db => {
//                     const [customer] = await customerEntityGateway.findOrCreateCustomerByPhone('', {}, null, { db });

//                     const customerInDb = await db.models.customer.findOne();
//                     assert.ok(customer);
//                     assert.strictEqual(customer.id, customerInDb.id);
//                 });
//             });

//             it('Returns created=true', async () => {
//                 await useTestDb(async db => {
//                     const [, created] = await customerEntityGateway.findOrCreateCustomerByPhone('', {}, null, { db });
//                     assert.strictEqual(created, true);
//                 });
//             });
//         });

//         describe('If already exists', () => {
//             it("Doesn't create customer", async () => {
//                 await useTestDb(async db => {
//                     const phone = '';
//                     await db.models.customer.create({ phone });

//                     await customerEntityGateway.findOrCreateCustomerByPhone(phone, {}, null, { db });

//                     const customersAfter = await db.models.customer.findAll();
//                     assert.strictEqual(customersAfter.length, 1);
//                 });
//             });

//             it('Returns existing customer', async () => {
//                 await useTestDb(async db => {
//                     const phone = '';
//                     await db.models.customer.create({ phone });

//                     const [customer] = await customerEntityGateway.findOrCreateCustomerByPhone(phone, {}, null, { db });

//                     const customerInDb = await db.models.customer.findOne();
//                     assert.ok(customer);
//                     assert.strictEqual(customer.id, customerInDb.id);
//                 });
//             });

//             it('Returns created=false', async () => {
//                 await useTestDb(async db => {
//                     const phone = '';
//                     await db.models.customer.create({ phone });
//                     const [, created] = await customerEntityGateway.findOrCreateCustomerByPhone(phone, {}, null, {
//                         db,
//                     });
//                     assert.strictEqual(created, false);
//                 });
//             });
//         });
//     });
// });
