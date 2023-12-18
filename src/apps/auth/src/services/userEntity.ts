import {
  Dependencies,
  injectDependencies,
} from '../../../util/dependencyInjector';
import {
  findOrCreateUser,
  getUser,
  updateUser,
  getUsers,
  createUsers,
  findElseCreateUser,
} from './userEntityGateway';
import { IUser } from '../models/user';
import cryptoUtil from '../../../util/crypto';
import { UserEntity } from '../models/user.entity';
import { EntityManager } from 'typeorm';
// This creates a new type that has all the properties of UserEntity but makes them optional
type PartialUserEntity = Partial<UserEntity>;

// This creates a new type that has only the properties of UserEntity that you want
type IUserEntity = Pick<PartialUserEntity, keyof IUser>;
class User {
  private _email: string = null;
  private data: IUserEntity = null;
  private dependencies: Dependencies = null;
  private _isNewlyCreated = false;

  private async getDataIfNeeded() {
    if (!this.data && this._email) {
      this.data = await getUser(this._email, this.dependencies);
    }
  }

  constructor(email: string, dependencies: Dependencies = null) {
    this.dependencies = injectDependencies(dependencies, ['db']);
    this._email = email && email.trim().toLowerCase();
  }

  static async findOrCreate(
    user: IUser,
    passwordHash: string,
    transaction: EntityManager,
    dependencies: Dependencies = null,
  ): Promise<User> {
    dependencies = injectDependencies(dependencies, ['db']);
    const [userData, isNewlyCreated] = await findOrCreateUser(
      user.email.trim().toLowerCase(),
      {
        email: user.email.trim().toLowerCase(),
        password: passwordHash,
        lockReason: user.lockReason,
        fullName: user.fullName,
      },
      transaction,
      dependencies,
    );
    const newUser = new User(user.email, dependencies);
    newUser.data = userData;
    newUser._isNewlyCreated = isNewlyCreated;
    return newUser;
  }

  static async findElseCreate(
    user: IUser,
    passwordHash: string,
    transaction: EntityManager,
    dependencies: Dependencies = null,
  ): Promise<User> {
    dependencies = injectDependencies(dependencies, ['db']);
    const [userData, isNewlyCreated] = await findElseCreateUser(
      user.email.trim().toLowerCase(),
      {
        email: user.email.trim().toLowerCase(),
        password: passwordHash,
        lockReason: user.lockReason,
        fullName: user.fullName,
      },
      transaction,
      dependencies,
    );

    const newUser = new User(user.email, dependencies);
    (newUser.data as unknown) = userData;
    (newUser._isNewlyCreated as unknown) = isNewlyCreated;
    return newUser;
  }

  static async getByEmails(
    emails: string[],
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<User[]> {
    dependencies = injectDependencies(dependencies, ['db']);
    const userDatas = await getUsers(emails, transaction, dependencies);
    return userDatas.map((userData) => {
      const user = new User(userData.email, dependencies);
      user.data = userData;
      return user;
    });
  }

  static async bulkCreate(
    users: (Partial<IUser> & { email: string })[],
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await createUsers(users, transaction, dependencies);
  }

  async exists(): Promise<boolean> {
    await this.getDataIfNeeded();
    return !!this.data;
  }

  async passwordMatches(password: string): Promise<boolean> {
    await this.getDataIfNeeded();
    return cryptoUtil.compare(password, this.data.password);
  }

  async update(
    user: Partial<Omit<IUser, 'email'>>,
    transaction: EntityManager,
  ): Promise<void> {
    const newData = { ...user, email: this._email };
    await updateUser(newData, transaction, this.dependencies);

    this.data = {
      ...this.data,
      ...newData,
    };
  }

  async isLocked(): Promise<boolean> {
    await this.getDataIfNeeded();
    return this.data.lockReason !== null;
  }

  get password(): Promise<string> {
    return this.getDataIfNeeded().then(() => {
      return this.data.password;
    });
  }

  get email(): string {
    return this._email;
  }

  get isNewlyCreated(): boolean {
    return this._isNewlyCreated;
  }

  get lockReason(): Promise<IUser['lockReason']> {
    return this.getDataIfNeeded().then(
      () => this.data.lockReason as 'needs review',
    );
  }
}

export default User;
