export type IQueueGroupPermissionTypes = {
    canManageQueue: boolean;
    canManagePermissions: boolean;
    isOwner: boolean;
};

export type IPermission = {
    id?: number;
    userEmail?: string;
    queueGroupId?: number | string;
} & IQueueGroupPermissionTypes;
