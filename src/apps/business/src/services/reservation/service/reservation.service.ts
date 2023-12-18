// import { ResultBoundary } from '..';
import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { IQueueGroup } from '../../../../../types/queueGroup';
import { useTransaction } from '../../../../../Config/transaction';
// import from '../../entityGateway/transaction';
import QueueGroupUserPermission from '../../Permissions/Entity/queueGroupUserPermission';
import Reservation from '../Entity/reservation';
import Customer from '../../../../../customer/src/services/customer/Entity/customer';
// import QueueArea from '@/apps/business/src/models/Area/queueArea.entity';
import Area from '../../Area/Entity/area';
import { IQueueArea } from '../../../../../types/queueArea';
import ReservationQueueArea from '../Entity/reservationQueueArea';
import { IQueueGroupTable } from '../../../../../types/queueGroupTable';
import ReservationTrait from '../Entity/reservationTrait';
import Table from '../../Table/Entity/queueGroupTable';
import {
  BadRequestException,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Next,
} from '@nestjs/common';
import { RedisCacheService } from '../../../../../redis/redis.service';
import { Cache } from 'cache-manager';
import { IFeedback } from '../../../../../types/feedback';
import {
  IReservation,
  ReservationTraitType,
} from '../../../../../types/reservation';
type GetQueueGroupByEmailFailureReason = "doesn't exist";
type GetQueueGroupReservationsSuccessData = Array<
  IReservation & {
    customer: { name: string; phone: string };
    traits: { type: ReservationTraitType }[];
    areas: { id: number; name: string }[];
  }
>;
@Injectable()
export class ReservationService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async createReservation(
    queueGroupId: string,
    reservation: IReservation & {
      customer: {
        name: string;
        phone: string;
      };
      traits: ReservationTraitType[];
      areas: number[];
      tables: number[];
    },
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    return useTransaction(async (transaction) => {
      const [customer] = await Customer.findOrCreateByPhone(
        this.cacheManager,
        reservation.customer.phone,
        {
          name: reservation.customer.name,
          phone: reservation.customer.phone,
        },
        transaction,
        dependencies,
      );
      const createdReservation = await Reservation.create(
        {
          ...reservation,
          customerId: customer.id,
          queueGroupId: Number(queueGroupId),
        },
        transaction,
        dependencies,
      );
      await Promise.all([
        ReservationQueueArea.bulkCreate(
          createdReservation.id,
          reservation.areas,
          transaction,
          dependencies,
        ),
        ReservationTrait.bulkCreate(
          createdReservation.id,
          reservation.traits,
          transaction,
          dependencies,
        ),
        // TODO: bulkCreate reservationMapObjects based on reservation.tables
      ]);

      // transaction.afterCommit(() => {
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(queueGroupId)}/reservation`,
      );
      // });
    }, dependencies);
  }

  async getQueueGroupReservations(
    queueGroupId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
        this.cacheManager,
        queueGroupId,
        requestingUserEmail,
        dependencies,
      );
      if (!permission || (!permission.isOwner && !permission.canManageQueue)) {
        throw new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }

      const reservations = await Reservation.getOfQueueGroup(
        transaction,
        queueGroupId,
        dependencies,
      );

      return reservations.map((reservation) => ({
        id: reservation.id,
        date: reservation.date,
        startTimeHour: reservation.startTimeHour,
        startTimeMinute: reservation.startTimeMinute,
        endTimeHour: reservation.endTimeHour,
        endTimeMinute: reservation.endTimeMinute,
        peopleCount: reservation.peopleCount,
        comment: reservation.comment,
        customer: reservation.customer && {
          name: reservation.customer.name,
          phone: reservation.customer.phone,
        },
        traits:
          reservation.traits &&
          reservation.traits.map((trait) => ({
            type: trait.type,
          })),
        areas:
          reservation.areas &&
          reservation.areas.map((area) => ({
            id: area.id,
            name: area.name,
          })),
      }));
    });
  }
}
