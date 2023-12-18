import { ICustomer, ISanitizedCustomer } from './customer';
import { IQueue } from './queue';
import { QueueCustomerTraitTypes } from './queueCustomerTrait';

export const QueueCustomerLeaveReasons = [
  'served',
  'quit',
  'removed',
  'expired',
  'inActive',
  'delete',
] as const;

export type IQueueCustomer = {
  id: number;
  joinTime: Date;
  leaveTime: Date;
  callTime: Date;
  number: number;
  snoozeCounter: number;
  peopleCount: number;
  leaveReason: (typeof QueueCustomerLeaveReasons)[number];
  comment: string;
  notifyUsingSms: boolean;
  confirmed: boolean;
  complete: boolean;
  customerId?: string;
  customer?: ICustomer;
  queueId?: number;
  queue?: IQueue;
  areas?: {
    id?: number;
    queueCustomerId?: any;
    queueAreaId: number;
    queueArea?: {
      name: {
        english: string;
        hebrew: string;
      };
    };
  }[];
  traits?: {
    id?: number;
    type: (typeof QueueCustomerTraitTypes)[number];
  }[];
};

export type ISanitizedQueueCustomer = Omit<
  IQueueCustomer,
  'customerId' | 'customer'
> & {
  customer: ISanitizedCustomer;
};

export type SubRoute =
  | ''
  | 'joinQuestionnaire'
  | 'editQuestionnaire'
  | 'enroute'
  | 'joinSuccess'
  | 'expired'
  | 'quit'
  | 'removed'
  | 'feedback/default'
  | 'feedback/success'
  | 'feedback/quit'
  | 'feedback/current'
  | 'feedback/removed';

export type SuccessMessage = '' | 'rejoinQueueSuccess' | 'feedbackSubmitted';
