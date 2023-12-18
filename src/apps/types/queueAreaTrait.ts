export const QueueAreaTraitTypes = ['smoker', 'handicapped'] as const;

export type IQueueAreaTrait = {
    id: number;
    type: typeof QueueAreaTraitTypes[number];
    queueAreaId?: number;
};
