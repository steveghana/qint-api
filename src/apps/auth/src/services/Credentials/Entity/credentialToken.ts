import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import {
  createCredentialToken,
  deactivateCredentialTokenByUuid,
  getCredentialTokenByUuid,
  renewCredentialTokenUuid,
} from '../DBGateway/credentialToken';
import { ICredentialToken } from '../../../../../types/credentialToken';
import { EntityManager } from 'typeorm';

class CredentialToken {
  dependencies: Dependencies = null;
  data: ICredentialToken = null;

  constructor(dependencies: Dependencies = null) {
    this.dependencies = injectDependencies(dependencies, ['db', 'config']);
  }

  static async createForUser(
    userEmail: string,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<CredentialToken> {
    dependencies = injectDependencies(dependencies, ['db']);
    const credentialToken = new CredentialToken(dependencies);
    credentialToken.data = await createCredentialToken(
      userEmail,
      transaction,
      dependencies,
    );
    return credentialToken;
  }

  static async getByUuid(
    uuid: string,
    dependencies: Dependencies = null,
  ): Promise<CredentialToken> {
    dependencies = injectDependencies(dependencies, ['db']);
    const credentialToken = new CredentialToken(dependencies);
    credentialToken.data = await getCredentialTokenByUuid(
      uuid,
      null,
      dependencies,
    );
    return credentialToken;
  }

  static async deactivateByUuid(
    uuid: string,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await deactivateCredentialTokenByUuid(uuid, dependencies);
  }

  renewUuid(transaction: EntityManager = null): Promise<string> {
    return renewCredentialTokenUuid(
      this.data.id,
      transaction,
      this.dependencies,
    );
  }

  get id(): number {
    return this.data.id;
  }

  get uuid(): string {
    return this.data.uuid;
  }

  get userEmail(): string {
    return this.data.userEmail;
  }

  get exists(): boolean {
    return this.data !== null;
  }

  isInactive(): boolean {
    return (
      !this.data.isActive ||
      Date.now() - new Date(this.data.createdAt).getTime() >
        this.dependencies.config.authentication.credentialTokenTTL
    );
  }
}

export default CredentialToken;
