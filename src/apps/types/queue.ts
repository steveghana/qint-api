import { IQueueCustomer } from './queueCustomer';
import { IQueueGroup } from './queueGroup';

export type IQueue = {
  id?: number;
  name: string;
  nextEnqueueNumber: number;
  queueGroupId?: number;
  queueGroup?: IQueueGroup;
  QRId?: string;
  queueCustomers?: IQueueCustomer[];
  isCustomDisplay?: boolean;
  resetNumberTime: Date;
  currentlyServedQueueCustomerId?: number;
};

export type IProcessedQueue = IQueue & {
  nowServingNumber: number;
  currentCustomer: IQueueCustomer;
  previousQueueCustomers: IQueueCustomer[];
};
