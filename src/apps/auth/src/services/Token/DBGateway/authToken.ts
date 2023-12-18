import { subMilliseconds } from 'date-fns';

import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { HttpException, HttpStatus, Next } from '@nestjs/common';

import { IUser } from '../../../../../types/user';
import { Brackets, DeepPartial, EntityManager, LessThan } from 'typeorm';
import { AuthtokenEntity } from '../../../models/Token/authToken.entity';
import { useTransaction } from '../../../../../../apps/Config/transaction';
import { CredentialTokenEntity } from '../../../models/CredentialToken/credentialToken.entity';
import myDataSource from '../../../../../../../db/data-source';
import { BusinessPermissionEntity } from '../../../../../../apps/business/src/models/Permissions/permission.entity';
import { ICredentialToken } from '../../../../../../apps/types/credentialToken';
import uuid from '../../../../../../apps/util/uuid';

type IAuthToken = {
  id: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  userEmail: string;
};
type authTokenInput = {
  credentialTokenId: number;
  userEmail: string;
} & DeepPartial<AuthtokenEntity>;

export async function createAuthToken(
  userEmail: string,
  credentialTokenId: number = null,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<IAuthToken> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const authTokenRepository = transaction.getRepository(
    dependencies.db.models.authToken,
  );
  const credTokenRepository = transaction.getRepository(
    dependencies.db.models.credentialToken,
  );
  const queueGroupRepo = transaction.getRepository(
    dependencies.db.models.queueGroup,
  );
  const user = await transaction
    .getRepository(dependencies.db.models.user)
    .findOne({
      where: { email: userEmail },
      relations: ['authToken', 'credentials'],
    });

  if (!user) {
    throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
  }

  let credentialToken = null;
  if (credentialTokenId !== null) {
    credentialToken = await credTokenRepository.findOne({
      where: { id: credentialTokenId },
    });
    if (!credentialToken) {
      throw new HttpException(
        'Credential token not found',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  const newAuthToken = authTokenRepository.create({
    // id: uuid.makeUuid(),
    lastUsed: new Date(),
    user,
    credentialTokens: credentialToken,
  });
  const savedAuthToken = await authTokenRepository.save(newAuthToken);
  return savedAuthToken as unknown as IAuthToken;
}

export async function getAuthTokenWithUser(
  authTokenId: string,
  dependencies: Dependencies = null,
): Promise<IAuthToken & { user: IUser }> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return useTransaction(async (transaction) => {
    const authRepo = transaction.getRepository(
      dependencies.db.models.authToken,
    );

    const data = await authRepo.findOne({
      where: {
        id: authTokenId,
      },
      relations: ['user'],
    });
    return data && ((await data) as unknown as IAuthToken & { user: IUser });
  }, dependencies);
}

export async function updateAuthTokenLastUsedIfActive(
  authTokenId: string,
  newLastUsed: Date = new Date(),
  authTokenIdleTTL: number,
  authTokenAbsoluteTTL: number,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const tokenRepo = myDataSource.manager.getRepository(
    dependencies.db.models.authToken,
  );
  console.log('updating lastused', new Date());
  await tokenRepo
    .createQueryBuilder()
    .update(AuthtokenEntity)
    .set({ lastUsed: new Date() })
    .where('id = :id', { id: authTokenId })
    .andWhere('isActive = true')
    .andWhere('lastUsed >= :lastUsed', {
      lastUsed: subMilliseconds(new Date(), authTokenIdleTTL),
    })
    .andWhere('createdAt >= :createdAt', {
      createdAt: subMilliseconds(new Date(), authTokenAbsoluteTTL),
    })
    .execute();
}

export async function deactivateExpiredAuthTokens(
  authTokenIdleTTL: number,
  authTokenAbsoluteTTL: number,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const tokenRepo = myDataSource.manager.getRepository(
    dependencies.db.models.authToken,
  );

  // return;
  await tokenRepo
    .createQueryBuilder()
    .update(AuthtokenEntity)
    .set({ isActive: false })
    .where('isActive = true')
    .andWhere(
      new Brackets((qb) =>
        qb
          .where('lastUsed < :lastUsed', {
            lastUsed: subMilliseconds(new Date(), authTokenIdleTTL),
          })
          .orWhere('createdAt < :createdAt', {
            createdAt: subMilliseconds(new Date(), authTokenAbsoluteTTL),
          }),
      ),
    )
    .execute();
}

export async function deactivateAuthToken(
  authTokenId: string,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  await dependencies.db.models.authToken.update(
    { id: authTokenId },
    { isActive: false },
  );
}

export async function deactiveAuthTokenOfCredentialToken(
  credentialTokenId: number,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const authtokenRepo = transaction.getRepository(
    dependencies.db.models.authToken,
  );
  await authtokenRepo.update(
    { credentialTokens: { id: credentialTokenId }, isActive: true },
    { isActive: false },
  );
}

export default {
  createAuthToken,
  getAuthTokenWithUser,
  updateAuthTokenLastUsedIfActive,
  deactivateExpiredAuthTokens,
  deactivateAuthToken,
  deactiveAuthTokenOfCredentialToken,
};
