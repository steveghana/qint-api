import { MigrationInterface, QueryRunner } from "typeorm";

export class QueueintDb1702906737749 implements MigrationInterface {
    name = 'QueueintDb1702906737749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "credentialToken" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "userEmail" character varying, CONSTRAINT "UQ_2a084410d847ef16323a2f500fe" UNIQUE ("uuid"), CONSTRAINT "PK_3df76481d610656845be1b220b1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "authToken" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "lastUsed" TIMESTAMP NOT NULL DEFAULT '"2023-12-18T13:39:00.392Z"', "credentialTokenId" integer, "userEmail" character varying, CONSTRAINT "PK_eb8fa60b49ec49031fa0cab6d3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "fullName" character varying NOT NULL DEFAULT '', "password" character varying NOT NULL, "lockReason" character varying, CONSTRAINT "PK_e12875dfb3b1d92d7d7c5377e22" PRIMARY KEY ("email"))`);
        await queryRunner.query(`CREATE TABLE "businessPermissions" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "canManageQueue" boolean NOT NULL DEFAULT false, "canManagePermissions" boolean NOT NULL DEFAULT false, "isOwner" boolean NOT NULL DEFAULT false, "queueGroupId" integer, "userEmail" character varying, CONSTRAINT "PK_e38773d480edf29727d16964da9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feedback" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "businessId" integer NOT NULL, "rating" integer NOT NULL, "text" character varying NOT NULL, "customerId" uuid, CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservationQueueArea" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "queueAreaId" integer, "reservationId" integer, CONSTRAINT "PK_dacd619f898dbc3ee04c1be7262" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservationTrait" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "type" character varying NOT NULL, "reservationId" integer, CONSTRAINT "PK_16ec0a2de0f0a6ff075e7d0c02c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservation" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "startTimeHour" integer NOT NULL, "startTimeMinute" integer NOT NULL, "endTimeHour" integer NOT NULL, "endTimeMinute" integer NOT NULL, "peopleCount" integer NOT NULL DEFAULT '1', "comment" character varying NOT NULL DEFAULT '', "text" character varying NOT NULL DEFAULT '', "imageUrl" character varying NOT NULL DEFAULT '', "queueGroupId" integer, "customerId" uuid, CONSTRAINT "PK_48b1f9922368359ab88e8bfa525" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL, "name" character varying, "phone" character varying, "agent" character varying, "ipAddress" character varying, "vapidEndpoint" character varying, "vapidEndpointIv" character varying, "vapidP256dh" character varying, "vapidP256dhIv" character varying, "vapidAuth" character varying, "vapidAuthIv" character varying, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "queueCustomerTrait" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "type" "public"."queueCustomerTrait_type_enum" NOT NULL, "queueCustomerId" integer, CONSTRAINT "PK_95800e0a20db111cc10443c383e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "queueCustomerQueueArea" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "queueCustomerId" integer, "queueAreaId" integer, CONSTRAINT "PK_87de0ce0524dc422deffc266e53" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "advertisement" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "description" character varying NOT NULL DEFAULT '', "text" character varying NOT NULL DEFAULT '', "imageUrl" character varying NOT NULL DEFAULT '', "addType" character varying NOT NULL DEFAULT 'interactive', "currency" character varying NOT NULL DEFAULT 'USD', "price" character varying, "base64Img" bytea NOT NULL, "cartItemId" integer, "queueGroupId" integer, CONSTRAINT "PK_c8486834e5ef704ec05b7564d89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cartItem" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "cartId" integer, "advertisementId" integer, CONSTRAINT "PK_56da2bf3db528f1d91566fd46e0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "totalPrice" integer, "qty" integer, "time" TIMESTAMP DEFAULT '"2023-12-18T13:39:00.581Z"', "orderPlaced" boolean NOT NULL DEFAULT false, "completed" boolean NOT NULL DEFAULT false, "queueCustomerId" integer, CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "queueCustomer" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "joinTime" TIMESTAMP DEFAULT '"2023-12-18T13:39:00.582Z"', "leaveTime" TIMESTAMP, "callTime" TIMESTAMP, "number" integer NOT NULL, "snoozeCounter" integer NOT NULL DEFAULT '0', "peopleCount" integer NOT NULL DEFAULT '1', "leaveReason" "public"."queueCustomer_leavereason_enum", "comment" character varying NOT NULL DEFAULT '', "notifyUsingSms" boolean NOT NULL DEFAULT false, "confirmed" boolean NOT NULL DEFAULT false, "complete" boolean NOT NULL DEFAULT false, "customerId" uuid, "queueId" integer, CONSTRAINT "PK_4b77cb9c4a040a9575570eab317" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "queue" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "QRId" character varying(255), "isCustomDisplay" boolean NOT NULL DEFAULT false, "nextEnqueueNumber" integer NOT NULL DEFAULT '1', "resetNumberTime" date, "queueGroupId" integer, "currentlyServedQueueCustomer" integer, CONSTRAINT "PK_4adefbd9c73b3f9a49985a5529f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "queueAreaQueueTable" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "queueAreaId" integer, "queueGroupTableId" integer, CONSTRAINT "PK_1fc6fccbb81bca62387f5888f0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "businessTable" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "capacity" integer NOT NULL, "minCapacity" integer NOT NULL DEFAULT '1', "queueGroupId" integer, CONSTRAINT "PK_0932145773d60b1ede8233970a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "queueGroup" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying, "logoUrl" character varying, "address" character varying, "geometryLat" double precision, "geometryLong" double precision, "centerLat" double precision, "centerLong" double precision, "countryCode" integer, "phone" character varying, "type" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_54d34946ed0151720605147a7c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "queueArea" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" json, "queueGroupId" integer, CONSTRAINT "PK_d7ae85e1fdafaf25b91e48df45c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "queueAreaTrait" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "type" "public"."queueAreaTrait_type_enum" NOT NULL, "queueAreaId" integer, CONSTRAINT "PK_4e36e0ce43313ea709ec33417be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shorturl" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "shortComponent" character varying NOT NULL, "longComponent" character varying NOT NULL, "expirationDate" TIMESTAMP, CONSTRAINT "UQ_d4fb996cb4d353480a6ce3c310e" UNIQUE ("shortComponent"), CONSTRAINT "PK_d4fb996cb4d353480a6ce3c310e" PRIMARY KEY ("shortComponent"))`);
        await queryRunner.query(`ALTER TABLE "credentialToken" ADD CONSTRAINT "FK_fa3b591a5406eb5ee83158a83c7" FOREIGN KEY ("userEmail") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "authToken" ADD CONSTRAINT "FK_d1adaf94c83cb8593f6d744c1ba" FOREIGN KEY ("userEmail") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "authToken" ADD CONSTRAINT "FK_af81ec9611dce9d566ee9f5ec3a" FOREIGN KEY ("credentialTokenId") REFERENCES "credentialToken"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "businessPermissions" ADD CONSTRAINT "FK_bf74db8d4462238d7e19381987f" FOREIGN KEY ("userEmail") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "businessPermissions" ADD CONSTRAINT "FK_31ed106d3df4335e46cab2212d1" FOREIGN KEY ("queueGroupId") REFERENCES "queueGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_ef6487793b8d734158bfe95ce5f" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservationQueueArea" ADD CONSTRAINT "FK_83d2d5465b5d003450b78bab9f9" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservationQueueArea" ADD CONSTRAINT "FK_76c2bfef4a160f3a5c1d035b3e3" FOREIGN KEY ("queueAreaId") REFERENCES "queueArea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservationTrait" ADD CONSTRAINT "FK_60bbf2e701a39f469ea6fdf5bb7" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_5c74354fa4303cb901131851ce2" FOREIGN KEY ("queueGroupId") REFERENCES "queueGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_7dce8a5a6907476eba30fedde91" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queueCustomerTrait" ADD CONSTRAINT "FK_d9792d46c4cfd2a378e1b2910cd" FOREIGN KEY ("queueCustomerId") REFERENCES "queueCustomer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queueCustomerQueueArea" ADD CONSTRAINT "FK_811599a95094bd814edf86fac5d" FOREIGN KEY ("queueCustomerId") REFERENCES "queueCustomer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queueCustomerQueueArea" ADD CONSTRAINT "FK_fb5a787a89c3678754306152c4b" FOREIGN KEY ("queueAreaId") REFERENCES "queueArea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "advertisement" ADD CONSTRAINT "FK_e7e94587db61441e07dba0629a8" FOREIGN KEY ("cartItemId") REFERENCES "cartItem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "advertisement" ADD CONSTRAINT "FK_13849833b7c4aa66da80ff8b7fd" FOREIGN KEY ("queueGroupId") REFERENCES "queueGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cartItem" ADD CONSTRAINT "FK_758a7aa44831ea2e513bb435acd" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cartItem" ADD CONSTRAINT "FK_f7a4c83a1f780f54c23f6830c70" FOREIGN KEY ("advertisementId") REFERENCES "advertisement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_17eff54f8cd14735f14cac5e0b7" FOREIGN KEY ("queueCustomerId") REFERENCES "queueCustomer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queueCustomer" ADD CONSTRAINT "FK_0b808dfbb81e089b7d98cdf03e4" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queueCustomer" ADD CONSTRAINT "FK_e6bcc0580d6b5b565c44564fe8c" FOREIGN KEY ("queueId") REFERENCES "queue"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queue" ADD CONSTRAINT "FK_a026dfb6339166870fa56d22a31" FOREIGN KEY ("currentlyServedQueueCustomer") REFERENCES "queueCustomer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queue" ADD CONSTRAINT "FK_99c5a21d8107a56762dc2855db8" FOREIGN KEY ("queueGroupId") REFERENCES "queueGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queueAreaQueueTable" ADD CONSTRAINT "FK_b8d7ef73607d26092dac7261d0b" FOREIGN KEY ("queueAreaId") REFERENCES "queueArea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queueAreaQueueTable" ADD CONSTRAINT "FK_201d9a72fdab138914fb0f54ea7" FOREIGN KEY ("queueGroupTableId") REFERENCES "businessTable"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "businessTable" ADD CONSTRAINT "FK_9b42058f9384fbe6ab29801b02c" FOREIGN KEY ("queueGroupId") REFERENCES "queueGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queueArea" ADD CONSTRAINT "FK_c82591c50aa0e55272dbeb8385d" FOREIGN KEY ("queueGroupId") REFERENCES "queueGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queueAreaTrait" ADD CONSTRAINT "FK_5bbe12c886fac3b28cbaeee948c" FOREIGN KEY ("queueAreaId") REFERENCES "queueArea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queueAreaTrait" DROP CONSTRAINT "FK_5bbe12c886fac3b28cbaeee948c"`);
        await queryRunner.query(`ALTER TABLE "queueArea" DROP CONSTRAINT "FK_c82591c50aa0e55272dbeb8385d"`);
        await queryRunner.query(`ALTER TABLE "businessTable" DROP CONSTRAINT "FK_9b42058f9384fbe6ab29801b02c"`);
        await queryRunner.query(`ALTER TABLE "queueAreaQueueTable" DROP CONSTRAINT "FK_201d9a72fdab138914fb0f54ea7"`);
        await queryRunner.query(`ALTER TABLE "queueAreaQueueTable" DROP CONSTRAINT "FK_b8d7ef73607d26092dac7261d0b"`);
        await queryRunner.query(`ALTER TABLE "queue" DROP CONSTRAINT "FK_99c5a21d8107a56762dc2855db8"`);
        await queryRunner.query(`ALTER TABLE "queue" DROP CONSTRAINT "FK_a026dfb6339166870fa56d22a31"`);
        await queryRunner.query(`ALTER TABLE "queueCustomer" DROP CONSTRAINT "FK_e6bcc0580d6b5b565c44564fe8c"`);
        await queryRunner.query(`ALTER TABLE "queueCustomer" DROP CONSTRAINT "FK_0b808dfbb81e089b7d98cdf03e4"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_17eff54f8cd14735f14cac5e0b7"`);
        await queryRunner.query(`ALTER TABLE "cartItem" DROP CONSTRAINT "FK_f7a4c83a1f780f54c23f6830c70"`);
        await queryRunner.query(`ALTER TABLE "cartItem" DROP CONSTRAINT "FK_758a7aa44831ea2e513bb435acd"`);
        await queryRunner.query(`ALTER TABLE "advertisement" DROP CONSTRAINT "FK_13849833b7c4aa66da80ff8b7fd"`);
        await queryRunner.query(`ALTER TABLE "advertisement" DROP CONSTRAINT "FK_e7e94587db61441e07dba0629a8"`);
        await queryRunner.query(`ALTER TABLE "queueCustomerQueueArea" DROP CONSTRAINT "FK_fb5a787a89c3678754306152c4b"`);
        await queryRunner.query(`ALTER TABLE "queueCustomerQueueArea" DROP CONSTRAINT "FK_811599a95094bd814edf86fac5d"`);
        await queryRunner.query(`ALTER TABLE "queueCustomerTrait" DROP CONSTRAINT "FK_d9792d46c4cfd2a378e1b2910cd"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_7dce8a5a6907476eba30fedde91"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_5c74354fa4303cb901131851ce2"`);
        await queryRunner.query(`ALTER TABLE "reservationTrait" DROP CONSTRAINT "FK_60bbf2e701a39f469ea6fdf5bb7"`);
        await queryRunner.query(`ALTER TABLE "reservationQueueArea" DROP CONSTRAINT "FK_76c2bfef4a160f3a5c1d035b3e3"`);
        await queryRunner.query(`ALTER TABLE "reservationQueueArea" DROP CONSTRAINT "FK_83d2d5465b5d003450b78bab9f9"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_ef6487793b8d734158bfe95ce5f"`);
        await queryRunner.query(`ALTER TABLE "businessPermissions" DROP CONSTRAINT "FK_31ed106d3df4335e46cab2212d1"`);
        await queryRunner.query(`ALTER TABLE "businessPermissions" DROP CONSTRAINT "FK_bf74db8d4462238d7e19381987f"`);
        await queryRunner.query(`ALTER TABLE "authToken" DROP CONSTRAINT "FK_af81ec9611dce9d566ee9f5ec3a"`);
        await queryRunner.query(`ALTER TABLE "authToken" DROP CONSTRAINT "FK_d1adaf94c83cb8593f6d744c1ba"`);
        await queryRunner.query(`ALTER TABLE "credentialToken" DROP CONSTRAINT "FK_fa3b591a5406eb5ee83158a83c7"`);
        await queryRunner.query(`DROP TABLE "shorturl"`);
        await queryRunner.query(`DROP TABLE "queueAreaTrait"`);
        await queryRunner.query(`DROP TABLE "queueArea"`);
        await queryRunner.query(`DROP TABLE "queueGroup"`);
        await queryRunner.query(`DROP TABLE "businessTable"`);
        await queryRunner.query(`DROP TABLE "queueAreaQueueTable"`);
        await queryRunner.query(`DROP TABLE "queue"`);
        await queryRunner.query(`DROP TABLE "queueCustomer"`);
        await queryRunner.query(`DROP TABLE "cart"`);
        await queryRunner.query(`DROP TABLE "cartItem"`);
        await queryRunner.query(`DROP TABLE "advertisement"`);
        await queryRunner.query(`DROP TABLE "queueCustomerQueueArea"`);
        await queryRunner.query(`DROP TABLE "queueCustomerTrait"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "reservation"`);
        await queryRunner.query(`DROP TABLE "reservationTrait"`);
        await queryRunner.query(`DROP TABLE "reservationQueueArea"`);
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TABLE "businessPermissions"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "authToken"`);
        await queryRunner.query(`DROP TABLE "credentialToken"`);
    }

}
