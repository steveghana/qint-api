// import { strict as assert } from 'assert';
// import useTestDb from '../db/test';
// import areaEntityGateway from './area';
// import sinon from 'sinon';

// describe('area Entity Gateway', () => {
//     describe('getAreasOfQueueGroup()', () => {
//         it('Returns [] if no queueGroup', async () => {
//             await useTestDb(async db => {
//                 const actual = await areaEntityGateway.getAreasOfQueueGroup('', { db });
//                 assert.ok(actual);
//                 assert.strictEqual(actual.length, 0);
//             });
//         });

//         it('Returns [] if no queueAreas', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });
//                 assert.ok(actual);
//                 assert.strictEqual(actual.length, 0);
//             });
//         });

//         it('Returns queueArea of queueGroup', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 const queueArea = await db.models.queueArea.create({ queueGroupId: queueGroup.id, name: '' });

//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual.length, 1);
//                 assert.strictEqual(actual[0].id, queueArea.id);
//             });
//         });

//         it('Returns both queueAreas of queueGroup', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 await db.models.queueArea.create({ queueGroupId: queueGroup.id, name: '' });
//                 await db.models.queueArea.create({ queueGroupId: queueGroup.id, name: '' });

//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual.length, 2);
//             });
//         });

//         it("Doesn't return queueArea of other queueGroup", async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 await db.models.queueArea.create({ name: '' });

//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual.length, 0);
//             });
//         });

//         it("Returns [] traits if there's no traits", async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 await db.models.queueArea.create({ queueGroupId: queueGroup.id, name: '' });

//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual[0].traits.length, 0);
//             });
//         });

//         it('Returns trait of queueArea', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 const queueArea = await db.models.queueArea.create({ queueGroupId: queueGroup.id, name: '' });
//                 await db.models.queueArea.create({ queueGroupId: queueGroup.id, name: '' });
//                 const traitType = 'smoker';
//                 await db.models.queueAreaTrait.create({ queueAreaId: queueArea.id, type: traitType });

//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual[0].traits.length, 1);
//                 assert.strictEqual(actual[0].traits[0].type, traitType);
//                 assert.strictEqual(actual[1].traits.length, 0);
//             });
//         });
//     });

//     describe('createArea()', () => {
//         afterEach(() => {
//             sinon.restore();
//         });

//         it('Creates area', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });

//                 await areaEntityGateway.createAreas([{ queueGroupId: queueGroup.id, name: '' }], null, { db });

//                 const areaAfter = await db.models.queueArea.findOne();
//                 assert.ok(areaAfter);
//             });
//         });

//         it('Creates both areas', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });

//                 await areaEntityGateway.createAreas(
//                     [
//                         { queueGroupId: queueGroup.id, name: '' },
//                         { queueGroupId: queueGroup.id, name: '' },
//                     ],
//                     null,
//                     { db }
//                 );

//                 const areas = await db.models.queueArea.findAll();
//                 assert.strictEqual(areas.length, 2);
//             });
//         });

//         it('Creates area with trait', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 const traitType = 'smoker';

//                 await areaEntityGateway.createAreas(
//                     [{ queueGroupId: queueGroup.id, name: '', traits: [{ type: traitType }] }],
//                     null,
//                     { db }
//                 );

//                 const trait = await db.models.queueAreaTrait.findOne();
//                 assert.ok(trait);
//                 assert.strictEqual(trait.type, traitType);
//             });
//         });

//         it('Creates area with trait correctly despite queueAreaId belonging another area', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });

//                 const actualAreaName = 'actualAreaName';
//                 const anotherAreaName = 'anotherAreaName';
//                 const anotherArea = await db.models.queueArea.create({
//                     name: anotherAreaName,
//                     queueGroupId: queueGroup.id,
//                 });

//                 await areaEntityGateway.createAreas(
//                     [
//                         {
//                             queueGroupId: queueGroup.id,
//                             name: actualAreaName,
//                             traits: [{ type: 'smoker', queueAreaId: anotherArea.id } as any],
//                         },
//                     ],
//                     null,
//                     { db }
//                 );
//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual.find(area => area.name === actualAreaName).traits.length, 1);
//                 assert.strictEqual(actual.find(area => area.name === anotherAreaName).traits.length, 0);
//             });
//         });

//         it('Creates with transaction', async () => {
//             const transaction = {};
//             const createStub = sinon.stub();

//             await areaEntityGateway.createAreas([{ name: '' }], transaction as any, {
//                 db: {
//                     models: {
//                         queueArea: { bulkCreate: createStub },
//                     },
//                 } as any,
//             });

//             assert.strictEqual(createStub.called, true);
//             assert.strictEqual(createStub.args[0][1].transaction, transaction);
//         });

//         it('Uses the same transaction for both queueArea.bulkCreate and queueAreaTrait.bulkCreate', async () => {
//             const transaction = {};
//             const createStub = sinon.stub().resolves([1]);
//             const traitCreateStub = sinon.stub();

//             await areaEntityGateway.createAreas([{ name: '', traits: [{ type: 'smoker' }] }], transaction as any, {
//                 db: {
//                     models: {
//                         queueArea: { bulkCreate: createStub },
//                         queueAreaTrait: { bulkCreate: traitCreateStub },
//                     },
//                 } as any,
//             });

//             assert.strictEqual(createStub.called, true);
//             assert.strictEqual(createStub.args[0][1].transaction, transaction);

//             assert.strictEqual(traitCreateStub.called, true);
//             assert.strictEqual(traitCreateStub.args[0][1].transaction, transaction);
//         });
//     });

//     describe('updateArea()', () => {
//         it('Updates area name', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 const traitType = 'smoker';
//                 const areaName = 'name';
//                 await areaEntityGateway.createAreas(
//                     [{ queueGroupId: queueGroup.id, name: '', traits: [{ type: traitType }] }],
//                     null,
//                     { db }
//                 );

//                 const areaListAfterCreation = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 await areaEntityGateway.updateArea(
//                     queueGroup.id,
//                     [{ id: areaListAfterCreation[0].id, name: areaName }],
//                     null,
//                     {
//                         db,
//                     }
//                 );
//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual[0].name, areaName);
//             });
//         });

//         it('Cleans up traits', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 const traitType = 'smoker';
//                 const areaName = 'name';
//                 await areaEntityGateway.createAreas(
//                     [{ queueGroupId: queueGroup.id, name: '', traits: [{ type: traitType }] }],
//                     null,
//                     { db }
//                 );

//                 const areaListAfterCreation = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 await areaEntityGateway.updateArea(
//                     queueGroup.id,
//                     [{ id: areaListAfterCreation[0].id, name: areaName, traits: [] }],
//                     null,
//                     {
//                         db,
//                     }
//                 );
//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual[0].name, areaName);
//                 assert.strictEqual(actual[0].traits.length, 0);
//                 assert.strictEqual(areaListAfterCreation[0].traits.length, 1);
//             });
//         });

//         it('Sets up traits', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 const traitType = 'smoker';
//                 const areaName = 'name';
//                 await areaEntityGateway.createAreas([{ queueGroupId: queueGroup.id, name: '', traits: [] }], null, {
//                     db,
//                 });

//                 const areaListAfterCreation = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 await areaEntityGateway.updateArea(
//                     queueGroup.id,
//                     [{ id: areaListAfterCreation[0].id, name: areaName, traits: [{ id: null, type: traitType }] }],
//                     null,
//                     {
//                         db,
//                     }
//                 );
//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual[0].traits.length, 1);
//                 assert.strictEqual(areaListAfterCreation[0].traits.length, 0);
//             });
//         });

//         it('Updates with transaction', async () => {
//             const transaction = {};
//             const updateStub = sinon.stub();
//             await areaEntityGateway.updateArea(null, [{ name: '' }], transaction as any, {
//                 db: {
//                     models: {
//                         queueArea: { update: updateStub },
//                     },
//                 } as any,
//             });

//             assert.strictEqual(updateStub.called, true);
//             assert.strictEqual(updateStub.args[0][1].transaction, transaction);
//         });

//         it('Does not update area of another queueGroup', async () => {
//             await useTestDb(async db => {
//                 const queueGroupFirst = await db.models.queueGroup.create({ name: '' });
//                 const queueGroupSecond = await db.models.queueGroup.create({ name: '' });
//                 const areaNameNew = 'nameNew';
//                 const areaNameOld = 'nameOld';
//                 //for each of queueGroup create one area
//                 await areaEntityGateway.createAreas([{ queueGroupId: queueGroupFirst.id, name: areaNameOld }], null, {
//                     db,
//                 });
//                 await areaEntityGateway.createAreas([{ queueGroupId: queueGroupSecond.id, name: areaNameOld }], null, {
//                     db,
//                 });

//                 const areaListFirstBefore = await areaEntityGateway.getAreasOfQueueGroup(queueGroupFirst.id, { db });

//                 //update area of "wrong" group!
//                 await areaEntityGateway.updateArea(
//                     queueGroupSecond.id,
//                     [{ id: areaListFirstBefore[0].id, name: areaNameNew }],
//                     null,
//                     {
//                         db,
//                     }
//                 );
//                 const areaListFirst = await areaEntityGateway.getAreasOfQueueGroup(queueGroupFirst.id, { db });
//                 const areaListSecond = await areaEntityGateway.getAreasOfQueueGroup(queueGroupSecond.id, { db });

//                 assert.strictEqual(areaListFirst[0].name, areaNameOld);
//                 assert.strictEqual(areaListSecond[0].name, areaNameOld);
//             });
//         });

//         it('Does not destroy queueAreaTraits of other queueArea', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 const traitType = 'smoker';
//                 const firstAreaName = 'actualAreaName';
//                 const secondAreaName = 'anotherAreaName';
//                 //create two areas, each with one trait
//                 await areaEntityGateway.createAreas(
//                     [
//                         {
//                             queueGroupId: queueGroup.id,
//                             name: firstAreaName,
//                             traits: [{ type: traitType }],
//                         },
//                     ],
//                     null,
//                     { db }
//                 );
//                 await areaEntityGateway.createAreas(
//                     [
//                         {
//                             queueGroupId: queueGroup.id,
//                             name: secondAreaName,
//                             traits: [{ type: traitType }],
//                         },
//                     ],
//                     null,
//                     { db }
//                 );

//                 const areasBeforeUpdate = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 //delete traits from first area only
//                 await areaEntityGateway.updateArea(
//                     queueGroup.id,
//                     [
//                         {
//                             id: areasBeforeUpdate.find(area => area.name === firstAreaName).id,
//                             name: firstAreaName,
//                             traits: [],
//                         },
//                     ],
//                     null,
//                     { db }
//                 );

//                 const areasAfterUpdate = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.strictEqual(areasBeforeUpdate.find(area => area.name === firstAreaName).traits.length, 1);
//                 assert.strictEqual(areasBeforeUpdate.find(area => area.name === secondAreaName).traits.length, 1);

//                 assert.strictEqual(areasAfterUpdate.find(area => area.name === firstAreaName).traits.length, 0);
//                 assert.strictEqual(areasAfterUpdate.find(area => area.name === secondAreaName).traits.length, 1);
//             });
//         });

//         it('Does not create queueAreaTraits of other queueArea', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 const traitType = 'smoker';
//                 const firstAreaName = 'actualAreaName';
//                 const secondAreaName = 'anotherAreaName';
//                 //create two areas, without traits
//                 await areaEntityGateway.createAreas(
//                     [
//                         {
//                             queueGroupId: queueGroup.id,
//                             name: firstAreaName,
//                         },
//                     ],
//                     null,
//                     { db }
//                 );
//                 await areaEntityGateway.createAreas(
//                     [
//                         {
//                             queueGroupId: queueGroup.id,
//                             name: secondAreaName,
//                         },
//                     ],
//                     null,
//                     { db }
//                 );

//                 const areasBeforeUpdate = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 //create trait in first area only
//                 await areaEntityGateway.updateArea(
//                     queueGroup.id,
//                     [
//                         {
//                             id: areasBeforeUpdate.find(area => area.name === firstAreaName).id,
//                             name: firstAreaName,
//                             traits: [{ id: null, type: traitType }],
//                         },
//                     ],
//                     null,
//                     { db }
//                 );

//                 const areasAfterUpdate = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.strictEqual(areasAfterUpdate.find(area => area.name === firstAreaName).traits.length, 1);
//                 assert.strictEqual(areasAfterUpdate.find(area => area.name === secondAreaName).traits.length, 0);
//             });
//         });

//         it('Uses the same transaction for queuAreaTrait.destroy, queueAreaTrait.bulkCreate and queueArea.update', async () => {
//             const transaction = {};
//             const destroyStub = sinon.stub();
//             const bulkCreateStub = sinon.stub();
//             const updateStub = sinon.stub();

//             await areaEntityGateway.updateArea(
//                 '',
//                 [{ name: '', traits: [{ id: null, type: 'smoker' }] }],
//                 transaction as any,
//                 {
//                     db: {
//                         models: {
//                             queueAreaTrait: { destroy: destroyStub, bulkCreate: bulkCreateStub },
//                             queueArea: { update: updateStub },
//                         },
//                     } as any,
//                 }
//             );

//             assert.strictEqual(destroyStub.called, true);
//             assert.strictEqual(destroyStub.args[0][0].transaction, transaction);

//             assert.strictEqual(bulkCreateStub.called, true);
//             assert.strictEqual(bulkCreateStub.args[0][1].transaction, transaction);

//             assert.strictEqual(updateStub.called, true);
//             assert.strictEqual(updateStub.args[0][1].transaction, transaction);
//         });
//     });

//     describe('deleteAreas()', () => {
//         it('Deletes area', async () => {
//             await useTestDb(async db => {
//                 const queueGroup = await db.models.queueGroup.create({ name: '' });
//                 await areaEntityGateway.createAreas([{ queueGroupId: queueGroup.id, name: '', traits: [] }], null, {
//                     db,
//                 });

//                 const areaListAfterCreation = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 await areaEntityGateway.deleteAreas(queueGroup.id, [areaListAfterCreation[0].id], null, {
//                     db,
//                 });
//                 const actual = await areaEntityGateway.getAreasOfQueueGroup(queueGroup.id, { db });

//                 assert.ok(actual);
//                 assert.strictEqual(actual.length, 0);
//                 assert.strictEqual(areaListAfterCreation.length, 1);
//             });
//         });

//         it('Deletes with transaction', async () => {
//             const transaction = {};
//             const deleteStub = sinon.stub();
//             await areaEntityGateway.deleteAreas(null, [1], transaction as any, {
//                 db: {
//                     models: {
//                         queueArea: { destroy: deleteStub },
//                     },
//                 } as any,
//             });

//             assert.strictEqual(deleteStub.called, true);
//             assert.strictEqual(deleteStub.args[0][0].transaction, transaction);
//         });

//         it('Does not delete area of another queueGroup', async () => {
//             await useTestDb(async db => {
//                 const queueGroupFirst = await db.models.queueGroup.create({ name: '' });
//                 const queueGroupSecond = await db.models.queueGroup.create({ name: '' });
//                 //for each of queueGroup create one area
//                 await areaEntityGateway.createAreas([{ queueGroupId: queueGroupFirst.id, name: '' }], null, {
//                     db,
//                 });
//                 await areaEntityGateway.createAreas([{ queueGroupId: queueGroupSecond.id, name: '' }], null, {
//                     db,
//                 });

//                 const areaListFirstBefore = await areaEntityGateway.getAreasOfQueueGroup(queueGroupFirst.id, { db });

//                 //delete area of "wrong" group!
//                 await areaEntityGateway.deleteAreas(queueGroupSecond.id, [areaListFirstBefore[0].id], null, {
//                     db,
//                 });
//                 const areaListFirst = await areaEntityGateway.getAreasOfQueueGroup(queueGroupFirst.id, { db });
//                 const areaListSecond = await areaEntityGateway.getAreasOfQueueGroup(queueGroupSecond.id, { db });

//                 assert.strictEqual(areaListFirst.length, 1);
//                 assert.strictEqual(areaListSecond.length, 1);
//             });
//         });
//     });
// });
