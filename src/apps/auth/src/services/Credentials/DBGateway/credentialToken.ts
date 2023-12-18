import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import uuidUtil from '../../../../../util/uuid';
import { DeepPartial, EntityManager } from 'typeorm';
import { CredentialTokenEntity } from '../../../models/CredentialToken/credentialToken.entity';
import myDataSource from '../../../../../../../db/data-source';
import uuid from '../../../../../../apps/util/uuid';

type ICredentialToken = {
  id: number;
  uuid: string;
  isActive: boolean;
  createdAt: Date;
  userEmail: string;
};
type CreateCredentialTokenInput = {
  userEmail: string;
} & DeepPartial<CredentialTokenEntity>;

export async function createCredentialToken(
  userEmail: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) /* : Promise<ICredentialToken> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  const credentialRepo = transaction.getRepository(
    dependencies.db.models.credentialToken,
  );
  const userRepo = transaction.getRepository(dependencies.db.models.user);
  const user = await userRepo.findOne({
    where: {
      email: userEmail.trim().toLowerCase(),
    },
    relations: ['credentials'],
  });
  let newCredentialToken = await credentialRepo.create({
    user,
    uuid: uuid.makeUuid(),
  });
  let data = await credentialRepo.save(newCredentialToken);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data;
}

export function getCredentialTokenByUuid(
  uuid: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) /* : Promise<ICredentialToken> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return

  return myDataSource.manager
    .getRepository(dependencies.db.models.credentialToken)
    .findOne({
      where: { uuid },
    });
}

export async function renewCredentialTokenUuid(
  id: number,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<string> {
  dependencies = injectDependencies(dependencies, ['db']);
  // Make a new UUID, ensure it doesn't collide with other credentialToken
  let newUuid = uuidUtil.makeUuid();
  while (await getCredentialTokenByUuid(newUuid, transaction, dependencies)) {
    newUuid = uuidUtil.makeUuid();
  }

  await transaction
    .getRepository(dependencies.db.models.credentialToken)
    .update(
      {
        id,
      },
      { uuid: newUuid },
    );
  return newUuid;
}

export async function deactivateCredentialTokenByUuid(
  uuid: string,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const credentialRepo = myDataSource.manager.getRepository(
    dependencies.db.models.credentialToken,
  );
  await credentialRepo.update(
    {
      uuid,
      isActive: true,
    },
    {
      isActive: false,
    },
  );
}

export default {
  createCredentialToken,
  getCredentialTokenByUuid,
  renewCredentialTokenUuid,
  deactivateCredentialTokenByUuid,
};
