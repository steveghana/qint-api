import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Inject,
  CACHE_MANAGER,
  Next,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { EmailTemplate } from './emailtemplate';
import { useTransaction } from '../../../util/transaction';
import { IQueueGroupType } from '../../../types/queueGroup';
import cryptoUtil from '../../../util/crypto';
import User from './userEntity';
import CredentialToken from './Credentials/Entity/credentialToken';
import AuthToken from './Token/Entity/authToken';
import QueueGroup from '../../../business/src/services/Root/Entity/queueGroup';
import queueEntityGateway from '../../../queue/src/services/DBGateway/queue';
import {
  Dependencies,
  injectDependencies,
} from '../../../util/dependencyInjector';

import { UserEntity } from '../models/user.entity';
import { IUser } from '../models/user';
import queueGroupUserPermission from '../../../business/src/services/Permissions/Entity/queueGroupUserPermission';
import { generateAlphanumeric } from '../../../util/transaction';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async register(
    email: string,
    password: string,
    fullName: string,
    countryString: string,
    queueGroupInitial: {
      name: string;
      phone: string;
      type: IQueueGroupType;
      country: number;
      address: string;
      geometryLat: number;
      geometryLong: number;
      centerLat: number;
      centerLong: number;
    },
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'config', 'email']);
    const passwordHash = await cryptoUtil.hash(
      password,
      dependencies.config.authentication.passwordHashIterations,
    );

    return useTransaction(async (transaction) => {
      console.log('find else create');
      const user = await User.findElseCreate(
        {
          email,
          lockReason: dependencies.config.requireManualReviewToRegister
            ? 'needs review'
            : null,
          fullName,
        },
        passwordHash,
        transaction,
        dependencies,
      );
      if (user.isNewlyCreated) {
        console.log(' create queuegroup');

        const queueGroup = await QueueGroup.create(
          this.cacheManager,
          {
            name: queueGroupInitial.name,
            phone: queueGroupInitial.phone,
            type: queueGroupInitial.type,
            countryCode: queueGroupInitial.country,
            address: queueGroupInitial.address,
            centerLat: queueGroupInitial.centerLat,
            centerLong: queueGroupInitial.centerLong,
            geometryLat: queueGroupInitial.geometryLat,
            geometryLong: queueGroupInitial.geometryLong,
            logoUrl: '',
          },
          transaction,
          dependencies,
        );
        await queueGroupUserPermission.create(
          this.cacheManager,
          {
            isOwner: true,
            userEmail: email,
            queueGroupId: Number(queueGroup.id),
          },
          transaction,
          dependencies,
        );
        if (
          queueGroupInitial.type === 'Restaurant & Cafe' ||
          queueGroupInitial.type === 'Bar'
        ) {
          await queueEntityGateway.createQueue(
            this.cacheManager,
            {
              name: queueGroupInitial.name,
              queueGroupId: Number(queueGroup.id),
              QRId: generateAlphanumeric(4),
            },
            transaction,
            dependencies,
          );
        }
      } else {
        if (!(await user.passwordMatches(''))) {
          throw new HttpException('exists', HttpStatus.BAD_REQUEST);
        }

        await user.update(
          {
            password: passwordHash,
          },
          transaction,
        );
      }
      // const logoImagePath = path.join(__dirname, 'logo-color (2).png');

      // Read the logo image file
      // const logoImage = fs.readFileSync(logoImagePath);
      if (dependencies.config.requireManualReviewToRegister) {
        void dependencies.email.sendStyled({
          to: ['shushanran@gmail.com', 'ran@q-int.com'],
          subject: 'מישהו נרשם ל q-int: ' + email,
          rtl: true,
          // attachments: [
          //   {
          //     filename: 'logo-color (2).png',
          //     // content: logoImage,
          //     cid: 'logo@qint.com', // Use this CID in the email body to reference the image
          //   },
          // ],
          html: `<h1>
              שלום רן.<br/>
              מישהו נרשם הרגע למערכת <a href="https://www.q-int.com">q-int</a>
          </h1>
          <table>
              <tr>
                  <th>דוא"ל</th>
              </tr>
              <tr>
                  <td>${email}</td>
              </tr>
          </table>
          <br/><br/>
          בברכה,
          מערכת q-int
          `,
        });
      }

      void dependencies.email.sendStyled({
        to: [email],
        subject:
          countryString === 'IL'
            ? 'ברוכים הבאים לQ-int: '
            : 'Welcome to Q-int' + email,
        rtl: countryString === 'IL',
        // attachments: [
        //   {
        //     filename: 'logo-color (2).png',
        //     // content: logoImage,
        //     cid: 'logo@qint.com', // Use this CID in the email body to reference the image
        //   },
        // ],
        html: EmailTemplate(countryString, fullName),
      });
      // queueGroupInitial.country;
      return {
        email: user.email,
      };
    });
  }

  public async login(
    email: string,
    password: string,
    rememberMe = false,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'config']);
    const user = new User(email, dependencies);
    const exists = await user.exists();
    console.log('login started', exists);
    /**
     * Here we want to protect against a timing attack: https://en.wikipedia.org/wiki/Timing_attack
     * We don't want an attacker to know whether the user doesn't exist or the password is wrong.
     * For that we must do approximately the same amount of work on both execution branches, so the timing is equal.
     * If the user exists and has a password we hash and compare the password, which is relatively computationally expensive,
     * so we must do something equally expensive if the user doesn't exist.
     * We hash and compare to a fake password for that reason.
     */
    const fakePassword = await cryptoUtil.hash(
      '',
      dependencies.config.authentication.passwordHashIterations,
    );
    const passwordMatches = await (exists
      ? user.passwordMatches(password)
      : cryptoUtil.compare('', fakePassword));

    const passwordIsEmpty = await (exists
      ? user.passwordMatches('')
      : cryptoUtil.compare('', fakePassword));
    if (exists && passwordIsEmpty) {
      throw new HttpException('passwordless user', HttpStatus.BAD_REQUEST);
    }

    // We want to protect against a user enumeration attack.
    // That's why we want to behave the same whether the user exists or the password is wrong.
    // https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account
    if (!exists || (exists && !passwordMatches)) {
      throw new HttpException('generic', HttpStatus.BAD_REQUEST);
    }

    if (await user.isLocked()) {
      throw new HttpException(await user.lockReason, HttpStatus.BAD_REQUEST);
    }
    const [authToken, credentialToken] = await useTransaction(
      async (transaction) => {
        const c = rememberMe
          ? await CredentialToken.createForUser(
              email,
              transaction,
              dependencies,
            )
          : null;
        const a = await AuthToken.createForUser(
          email,
          c && c.id,
          transaction,
          dependencies,
        );
        return [a, c];
      },
      dependencies,
    );

    return {
      authTokenId: authToken.id,
      credentialTokenUuid: credentialToken && credentialToken.uuid,
    };
  }

  async loginWithCredentialToken(
    credentialTokenUuid: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);

    const credentialToken = await CredentialToken.getByUuid(
      credentialTokenUuid,
      dependencies,
    );
    if (!credentialToken.exists || credentialToken.isInactive()) {
      throw new HttpException('generic', HttpStatus.BAD_REQUEST);
    }

    const user = new User(credentialToken.userEmail, dependencies);
    if (!(await user.exists())) {
      throw new HttpException('generic', HttpStatus.BAD_REQUEST);
    }

    if (await user.passwordMatches('')) {
      throw new HttpException('passwordless user', HttpStatus.BAD_REQUEST);
    }

    if (await user.isLocked()) {
      throw new HttpException(await user.lockReason, HttpStatus.BAD_REQUEST);
    }

    const [newCredentialTokenUuid, authToken] = await useTransaction(
      async (transaction) => {
        const [c] = await Promise.all([
          credentialToken.renewUuid(transaction),
          AuthToken.expireOfCredentialToken(
            credentialToken.id,
            transaction,
            dependencies,
          ),
        ]);
        const a = await AuthToken.createForUser(
          credentialToken.userEmail,
          credentialToken.id,
          transaction,
          dependencies,
        );
        return [c, a];
      },
      dependencies,
    );

    return {
      authTokenId: authToken.id,
      credentialTokenUuid: newCredentialTokenUuid,
    };
  }
  async logout(
    authTokenId: string,
    credentialTokenUuid: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);

    const authToken = new AuthToken(authTokenId, dependencies);
    await Promise.all([
      authToken.deactivate(),
      CredentialToken.deactivateByUuid(credentialTokenUuid, dependencies),
    ]);
    // return new LogoutSuccess();
  }
}
