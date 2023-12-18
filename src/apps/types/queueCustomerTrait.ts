export const QueueCustomerTraitTypes = ['smoker', 'handicapped'] as const;

export type IQueueCustomerTrait = {
    id: number;
    type: typeof QueueCustomerTraitTypes[number];
    queueCustomerId?: string;
};
