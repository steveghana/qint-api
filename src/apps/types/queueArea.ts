import { IQueueAreaTrait } from './queueAreaTrait';
import { IQueueGroupTable } from './queueGroupTable';

export type IQueueArea = {
  id: number;
  name: {
    english?: string;
    hebrew?: string;
  };
  queueGroupId?: number;
  traits?: IQueueAreaTrait[];
  queueAreaQueueTables?: [{ queueGroupTable: IQueueGroupTable }];
  tables?: {
    capacity: number;
    minCapacity: number;
  }[];
};
