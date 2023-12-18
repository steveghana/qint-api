import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import {
  createAuthToken,
  getAuthTokenWithUser,
  updateAuthTokenLastUsedIfActive,
  deactivateExpiredAuthTokens,
  deactivateAuthToken,
  deactiveAuthTokenOfCredentialToken,
} from '../DBGateway/authToken';
import { IUser } from '../../../../../types/user';
import { IAuthToken } from '../../../models/Token/authToken';
import { EntityManager } from 'typeorm';
import { AuthtokenEntity } from '../../../models/Token/authToken.entity';

class AuthToken {
  private _id: string = null;
  private data: IAuthToken = null;
  dependencies: Dependencies = null;

  constructor(id: string, dependencies: Dependencies = null) {
    this.dependencies = injectDependencies(dependencies, ['db', 'config']);
    this._id = id;
  }

  static async createForUser(
    userEmail: string,
    credentialTokenId: number = null,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<AuthToken> {
    dependencies = injectDependencies(dependencies, ['db']);

    const data = await createAuthToken(
      userEmail,
      credentialTokenId,
      transaction,
      dependencies,
    );

    if (!data) {
      return null;
    }

    const authToken = new AuthToken(data.id, dependencies);
    authToken.data = data;
    return authToken;
  }

  static async getWithUser(
    id: string,
    dependencies: Dependencies = null,
  ): Promise<AuthToken> {
    dependencies = injectDependencies(dependencies, ['db']);
    const data = await getAuthTokenWithUser(id, dependencies);
    if (!data) {
      return null;
    }

    const authToken = new AuthToken(data.id, dependencies);
    authToken.data = data;
    authToken.data.user = data.user;
    return authToken;
  }

  static async expireOfCredentialToken(
    credentialTokenId: number,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await deactiveAuthTokenOfCredentialToken(
      credentialTokenId,
      transaction,
      dependencies,
    );
  }

  static async housekeep(dependencies: Dependencies = null): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db', 'config']);
    await deactivateExpiredAuthTokens(
      dependencies.config.authentication.authTokenIdleTTL,
      dependencies.config.authentication.authTokenAbsoluteTTL,
      dependencies,
    );
  }
  // lastused(): any {
  //   return this.data;
  // }
  isInactive(): boolean {
    return (
      !this.data.isActive ||
      Date.now() - new Date(this.data.lastUsed).getTime() >
        this.dependencies.config.authentication.authTokenIdleTTL ||
      Date.now() - new Date(this.data.createdAt).getTime() >
        this.dependencies.config.authentication.authTokenAbsoluteTTL
    );
  }

  async updateLastUsed(): Promise<void> {
    await updateAuthTokenLastUsedIfActive(
      this.id,
      null,
      this.dependencies.config.authentication.authTokenIdleTTL,
      this.dependencies.config.authentication.authTokenAbsoluteTTL,
      this.dependencies,
    );
  }

  async deactivate(): Promise<void> {
    await deactivateAuthToken(this._id, this.dependencies);
  }

  get id(): string {
    return this._id;
  }

  get userEmail(): string {
    return this.data.user.email;
  }

  get user(): IUser {
    return this.data.user;
  }
}

export default AuthToken;
