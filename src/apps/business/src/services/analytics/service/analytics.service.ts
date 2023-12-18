// import { ResultBoundary } from '..';
import { groupBy } from 'lodash';
import {
  startOfWeek,
  getHours,
  subMinutes,
  addMinutes,
  getDay,
} from 'date-fns';
import queueEntityGateway from '../../../../../queue/src/services/DBGateway/queue';
import queueCustomerEntityGateway from '../../../../../customer/src/services/QueueCustomer/DBGateway/queueGroupEntityGateway';
import { IQueueCustomer } from '../../../../../types/queueCustomer';
import QueueGroup from '../../Root/Entity/queueGroup';
import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { IQueueGroup } from '../../../../../types/queueGroup';
import { useTransaction } from '../../../../../Config/transaction';
// import from '../../entityGateway/transaction';
import QueueGroupUserPermission from '../../Permissions/Entity/queueGroupUserPermission';

// import QueueArea from '@/apps/business/src/models/Area/queueArea.entity';
import Area from '../../Area/Entity/area';
import { IQueueArea } from '../../../../../types/queueArea';

import { IQueueGroupTable } from '../../../../../types/queueGroupTable';
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
import { IAdvertisement } from '../../../../../../apps/types/advertisement';
type GetQueueGroupByEmailFailureReason = "doesn't exist";
type ShiftAnalyticsData = {
  queueGroupId: any;
  queueId: any;
  areas: {
    id: number;
    name: string;
    queueCustomerCount: number;
    peopleCount: number;
  }[];
  total: {
    queueCustomerCount: number;
    peopleCount: number;
  };
};
@Injectable()
export class AnalyticsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getAnalytic(
    queueGroupId: string,
    requestingUserEmail: string,
    timezoneOffset = new Date().getTimezoneOffset(),
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const dateToUtc = (d: Date) =>
        subMinutes(d, new Date().getTimezoneOffset());
      const adjustDateToTimezone = (d: Date) =>
        addMinutes(dateToUtc(d), timezoneOffset);

      const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
        this.cacheManager,
        queueGroupId,
        requestingUserEmail,
        dependencies,
      );
      if (!permission || !permission.isOwner) {
        throw new HttpException('not owner', HttpStatus.FORBIDDEN);
      }
      const queuesIds = await queueEntityGateway.getQueueIdsOfQueueGroup(
        this.cacheManager,
        queueGroupId,
        transaction,
        dependencies,
      );

      const queueCustomersThisWeek =
        (await queueCustomerEntityGateway.getQueueArrayCustomersEnqueuedAfter(
          this.cacheManager,
          queuesIds,
          adjustDateToTimezone(startOfWeek(new Date())),
          dependencies,
        )) as unknown as IQueueCustomer[];
      const filteredQueueCustomersThisWeek = queueCustomersThisWeek.filter(
        (queueCustomer) => queueCustomer.leaveReason !== 'expired',
      );
      const queueCustomersByDay = groupBy(
        filteredQueueCustomersThisWeek,
        (queueCustomer) => getDay(adjustDateToTimezone(queueCustomer.joinTime)),
      );
      //Days in a week
      let days = [0, 1, 2, 3, 4, 5, 6] as const;
      //Hrs in a day
      const hrsInDay = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23,
      ] as const;

      days.forEach((weekday) => {
        if (!queueCustomersByDay[weekday]) {
          queueCustomersByDay[weekday] = [];
        }
      });
      //Calcalate waiting times for each customer
      const waitingTimes = (customers: IQueueCustomer[]) =>
        customers
          .map((queueCustomer) => {
            const leaveTime =
              queueCustomer.leaveTime === null
                ? Date.now()
                : new Date(queueCustomer.leaveTime).getTime();
            const joinTime = new Date(queueCustomer.joinTime).getTime();
            return leaveTime - joinTime;
          })
          .sort();
      const queueCustomersByHour = groupBy(
        filteredQueueCustomersThisWeek,
        (queueCustomer) =>
          getHours(
            addMinutes(
              queueCustomer.joinTime,
              new Date().getTimezoneOffset() - timezoneOffset,
            ),
          ),
      );
      //Assign empty array if corresponding hour doesnt contain a value
      hrsInDay.forEach((hour) => {
        if (!queueCustomersByHour[hour]) {
          queueCustomersByHour[hour] = [];
        }
      });

      const hourData = Object.values(queueCustomersByHour).map(
        (queueCustomers) => {
          const totalVisitors = queueCustomers.length;
          let times = waitingTimes(queueCustomers);
          return {
            totalVisitors,
            waitingTimes: times,
          };
        },
      );
      //Weekly data
      const weekData = Object.values(queueCustomersByDay).map(
        (queueCustomers) => {
          const totalVisitors = queueCustomers.length;
          let grouped = groupBy(queueCustomers, (queueCustomer) =>
            getHours(
              addMinutes(
                queueCustomer.joinTime,
                new Date().getTimezoneOffset() - timezoneOffset,
              ),
            ),
          );
          hrsInDay.forEach((hour) => {
            if (!grouped[hour]) {
              grouped[hour] = [];
            }
          });

          const hourData = Object.values(grouped).map((queueCustomers) => {
            let times = waitingTimes(queueCustomers);
            return {
              totalVisitors,
              waitingTimes: times,
            };
          });

          const totalWaitingTime = waitingTimes(queueCustomers).reduce(
            (sum, cur) => sum + cur,
            0,
          );
          const averageWaitingTime =
            totalVisitors === 0 ? 0 : totalWaitingTime / totalVisitors;
          const medianWaitingTime =
            waitingTimes.length === 0
              ? 0
              : waitingTimes(queueCustomers)[
                  Math.floor(waitingTimes.length / 2)
                ];

          const customersByLeaveReason = groupBy(queueCustomers, 'leaveReason');
          return {
            totalVisitors,
            totalWaitingTime,
            waitingTimes: hourData,
            averageWaitingTime,
            medianWaitingTime,
            leaveReasons: {
              null: (customersByLeaveReason.null || []).length,
              served: (customersByLeaveReason.served || []).length,
              quit: (customersByLeaveReason.quit || []).length,
              removed: (customersByLeaveReason.removed || []).length,
            },
          };
        },
      );
      return {
        byWeekDay: weekData,
        byHour: hourData,
      };
    }, dependencies);
  }

  async getShiftAnalytic(
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const queueGroup = await QueueGroup.getByEmail(
        requestingUserEmail,
        this.cacheManager,
        dependencies,
      );
      if (!queueGroup || queueGroup.queues.length === 0) {
        throw new HttpException('not owner', HttpStatus.NOT_FOUND);
      }
      const queue = queueGroup.queues[0];

      const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
        this.cacheManager,
        queueGroup.id,
        requestingUserEmail,
        dependencies,
      );
      if (!permission) {
        throw new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }

      const [waitingQueueCustomers, dbAreas] = await Promise.all([
        queueCustomerEntityGateway.getWaitingQueueCustomers(
          this.cacheManager,
          String(queue.id),
          null,
          dependencies,
        ),
        Area.ofQueueGroup(
          this.cacheManager,
          transaction,
          queueGroup.id,
          dependencies,
        ),
      ]);

      const totalQueueCustomers = waitingQueueCustomers.length;
      const totalPeople = waitingQueueCustomers.reduce(
        (sum, queueCustomer) => sum + queueCustomer.peopleCount,
        0,
      );
      const areas: Record<
        number,
        {
          id: number;
          name: string;
          queueCustomerCount: number;
          peopleCount: number;
        }
      > = {};
      dbAreas.forEach((area) => {
        areas[area.id] = {
          id: area.id,
          name: area.name.english,
          queueCustomerCount: 0,
          peopleCount: 0,
        };
      });

      waitingQueueCustomers.forEach((queueCustomer) => {
        queueCustomer.areas.forEach((area) => {
          areas[area.queueAreaId].queueCustomerCount++;
          areas[area.queueAreaId].peopleCount += queueCustomer.peopleCount;
        });
      });

      return {
        queueGroupId: queueGroup.id,
        queueId: queue.id,
        areas: Object.values(areas).sort((area1, area2) =>
          area1.name.localeCompare(area2.name),
        ),
        total: {
          queueCustomerCount: totalQueueCustomers,
          peopleCount: totalPeople,
        },
      };
    }, dependencies);
  }
}
