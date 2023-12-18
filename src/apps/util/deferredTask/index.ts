import deferUtil from '../defer';
// import { QueueCustomerService } from '@/apps/customer/src/services/QueueCustomer/service';
const deferrableTasks = {
  notifyLongWaitingCustomer: (queueCustomerId: string) => {
    // void QueueCustomerService.prototype.notifyLongWaitingCustomer(
    //   queueCustomerId,
    // );
  },
};

export type DeferrableTask = keyof typeof deferrableTasks;

async function init(): Promise<void> {
  console.log('defered tasks initialised');
  await Promise.all(
    Object.entries(deferrableTasks).map(([key, proc]) =>
      deferUtil.registerProcedure(key, proc),
    ),
  );
}

async function deferTask<T extends DeferrableTask>(
  task: T,
  timeMs: number,
  ...params: Parameters<(typeof deferrableTasks)[T]>
): Promise<void> {
  await deferUtil.deferProcedure(task, timeMs, null, ...params);
}

export default {
  init,
  deferTask,
};
