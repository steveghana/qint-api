import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { useTransaction } from '../../../../../Config/transaction';
import QueueGroup from '../../Root/Entity/queueGroup';
import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Next,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { IFeedback } from '../../../../../types/feedback';
import { IPermission } from '../../../../../types/queueGroupUserPermission';
import QueueGroupUserPermission from '../Entity/queueGroupUserPermission';
import User from '../../../../../auth/src/services/userEntity';
import cryptoUtil from '../../../../../util/crypto';
import config from '../../../../../Config/config';
import permissionsHebrewLocale from './locale/he.json';
import { permissionTypeKeys } from '../../../../../util/queuePermissionTypes';
type GetQueueGroupByEmailFailureReason = "doesn't exist";
@Injectable()
export class UserPermissionsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setPermissions(
    requestingUserEmail: string,
    queueGroupId: string,
    permissions: IPermission[],
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'email']);

    const result = await useTransaction(async (transaction) => {
      const oldPermissions = await QueueGroupUserPermission.ofQueueGroup(
        this.cacheManager,
        queueGroupId,
        transaction,
        dependencies,
      );

      // Ensure that requesting user has permissions
      const requestingUserPermission = oldPermissions.find(
        (perm) => perm.userEmail === requestingUserEmail,
      );
      if (
        !requestingUserPermission ||
        !(
          requestingUserPermission.isOwner ||
          requestingUserPermission.canManagePermissions
        )
      ) {
        return new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }

      // Ensure that at least one owner will exist
      if (!permissions.find((permission) => permission.isOwner)) {
        return new HttpException('lacking owner', HttpStatus.BAD_REQUEST);
      }

      // Ensure that non-owner isn't de-priviliging owner or adding owners
      if (!requestingUserPermission.isOwner) {
        const oldOwners = oldPermissions
          .filter((permission) => permission.isOwner)
          .map((permission) => permission.userEmail)
          .sort();
        const newOwners = permissions
          .filter((permission) => permission.isOwner)
          .map((permission) => permission.userEmail)
          .sort();

        if (oldOwners.length !== newOwners.length) {
          return new HttpException('dont touch owners', HttpStatus.BAD_REQUEST);
        }
        for (let i = 0; i < oldOwners.length; ++i) {
          if (newOwners[i] !== oldOwners[i]) {
            return new HttpException(
              'dont touch owners',
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }

      // Create users that don't exist
      const permissionEmails = permissions.map(
        (permission) => permission.userEmail,
      );
      const existingUsers = await User.getByEmails(
        permissionEmails.map((email) => email.toLowerCase()),
        transaction,
        dependencies,
      );
      const notExistingUserEmails = permissionEmails.filter(
        (email) =>
          !existingUsers.find((user) => user.email === email.toLowerCase()),
      );
      await User.bulkCreate(
        await Promise.all(
          notExistingUserEmails.map(async (email) => ({
            email: email.toLowerCase(),
            password: await cryptoUtil.hash(
              '',
              config.authentication.passwordHashIterations,
            ),
          })),
        ),
        transaction,
        dependencies,
      );

      //Making a dictionary of the email adresses and which permissions they have.
      const permissionsPerEmail = Object.assign(
        {},
        ...permissions.map((permission) => ({
          [permission.userEmail]: permissionTypeKeys
            .filter((key) => permission[key])
            .map(
              (per) =>
                (permissionsHebrewLocale as any)[`permission/${per}`] as string,
            )
            .join(', '),
        })),
      );
      const queueGroupName = (
        await QueueGroup.getById(
          this.cacheManager,
          queueGroupId,
          null,
          dependencies,
        )
      ).name;
      await Promise.all(
        notExistingUserEmails.map((email) =>
          dependencies.email.sendStyled({
            to: email,
            subject: 'הוזמנת להצטרף ל Q-Int',
            rtl: true,
            html:
              `<p>היי, ראינו שקיבלת הזמנה להשתמש ב <a href="https://www.q-int.com">Q-Int</a></p>\n` +
              `<p> בעסק ${queueGroupName} עם ההרשאות הבאות: ${permissionsPerEmail[email]}\n` +
              `<p>האימייל שאיתו תוכל להיכנס לשירות הוא ${email}</p>\n` +
              `<p>על מנת להשתמש במערכת שלנו תצטרך לאשר את הזמנתך ולהירשם באתר שלנו - <a href="https://app.q-int.com/#/register">www.q-int.com</a></p>\n` +
              `<p>\n` +
              `   שימוש מהנה.<br/>\n` +
              `   בברכה,<br/>\n` +
              `   צוות Q-Int\n` +
              `</p>`,
          }),
        ),
      );

      // Update the permissions
      await QueueGroupUserPermission.destroyOfQueueGroup(
        this.cacheManager,
        queueGroupId,
        transaction,
        dependencies,
      );
      await QueueGroupUserPermission.bulkCreate(
        this.cacheManager,
        permissions.map((permission) => ({
          canManageQueue: permission.canManageQueue,
          canManagePermissions: permission.canManagePermissions,
          isOwner: permission.isOwner,
          userEmail: permission.userEmail.toLowerCase(),
          queueGroupId,
        })),
        transaction,
        dependencies,
      );

      // return new SetPermissionsSuccess();
    }, dependencies);
    return result;
  }
}
