// import assert from 'assert';
// import * as sinon from 'sinon';
// import { AuthService } from '../src/services/user.service';
// import User from '../src/services/userEntity';
// import QueueGroup from '../../business/src/services/Root/Entity/queueGroup';
// import QueueGroupUserPermission from '../../business/src/services/Permissions/Entity/queueGroupUserPermission';
// import queueEntityGateway from '../../queue/src/services/DBGateway/queue';
// import entityGatewayTransaction from '../../util/transaction';
// import { DataSource } from 'typeorm';
// import config from '../../../apps/Config/config';
// describe('userInteractor', () => {
//   let connection;

//   beforeEach(async () => {
//     connection = await new DataSource({
//       type: 'postgres',
//       host: 'localhost',
//       port: config.databasePort,
//       username: 'postgres',
//       password: 'password',
//       database: 'postgres',
//       entities: [User, QueueGroup, QueueGroupUserPermission],
//       synchronize: true,
//       logging: false,
//     });
//   });

//   afterEach(async () => {
//     await connection.close();
//   });
//   describe('register()', () => {
//     const userInteractor = new AuthService();
//     beforeEach(() => {
//       sinon.stub(entityGatewayTransaction, 'useTransaction').callsArg(0);
//       sinon
//         .stub(User, 'findElseCreate')
//         .resolves({ isNewlyCreated: true } as any);
//       sinon.stub(QueueGroupUserPermission, 'create');
//     });

//     afterEach(() => {
//       sinon.restore();
//     });

//     it('Creates queue if queueGroup is restaurant', async () => {
//       const queueGroupId = '42';
//       sinon.stub(QueueGroup, 'create').resolves({ id: queueGroupId } as any);
//       const createQueueStub = sinon.stub(queueEntityGateway, 'createQueue');

//       await userInteractor.register(
//         '',
//         '',
//         '',
//         { type: 'Restaurant & Cafe' } as any,
//         {
//           db: { sequelize: { transaction: () => {} } } as any,
//           config: { authentication: { passwordHashIterations: 1 } as any },
//         },
//       );

//       assert.ok(createQueueStub.called);
//       assert.strictEqual(createQueueStub.args[0][0].queueGroupId, queueGroupId);
//     });

//     it('Creates queue if queueGroup is Bar', async () => {
//       const queueGroupId = '42';
//       sinon.stub(QueueGroup, 'create').resolves({ id: queueGroupId } as any);
//       const createQueueStub = sinon.stub(queueEntityGateway, 'createQueue');

//       await userInteractor.register('', '', '', { type: 'Bar' } as any, {
//         db: { sequelize: { transaction: () => {} } } as any,
//         config: { authentication: { passwordHashIterations: 1 } as any },
//       });

//       assert.ok(createQueueStub.called);
//       assert.strictEqual(createQueueStub.args[0][0].queueGroupId, queueGroupId);
//     });

//     it("Doesn't create queue if queueGroup isn't restaurant", async () => {
//       sinon.stub(QueueGroup, 'create').resolves({ id: '42' } as any);
//       const createQueueStub = sinon.stub(queueEntityGateway, 'createQueue');

//       await userInteractor.register('', '', '', { type: 'Banks' } as any, {
//         db: { sequelize: { transaction: () => {} } } as any,
//         config: { authentication: { passwordHashIterations: 1 } as any },
//       });

//       assert.ok(createQueueStub.notCalled);
//     });
//   });
// });
