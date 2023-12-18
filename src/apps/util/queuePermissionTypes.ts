import { IQueueGroupPermissionTypes } from '../types/queueGroupUserPermission';

export const permissionTypeKeys: (keyof IQueueGroupPermissionTypes)[] = [
    'canManagePermissions',
    'canManageQueue',
    'isOwner',
];
