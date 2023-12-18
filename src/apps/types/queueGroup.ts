import { IQueue } from './queue';
import { default as countries } from 'i18n-iso-countries/langs/en.json';
import { IPermission } from './queueGroupUserPermission';
import { IQueueArea } from './queueArea';

export type IQueueGroup = {
  id?: number;
  name: string;
  logoUrl: string;
  countryCode: number;
  phone: string;
  address?: string;
  geometryLat?: number;
  geometryLong?: number;
  centerLat?: number;

  centerLong?: number;
  type: IQueueGroupType;
  queues?: IQueue[];
  permissions?: IPermission[];
  areas?: IQueueArea[];
};

export const QueueGroupPossibleTypes = [
  '',
  'Airline Check-in',
  'Auditions & Interviews',
  'Auto',
  'Banks',
  'Bar',
  'Barbershop & Beauty salon',
  'Clinics & Doctors office',
  'Dental',
  'Entertainment',
  'Events & Festivals',
  'Government',
  'Hospital',
  'Museum',
  'Nightclub',
  'Optometrist',
  'Pharmacy',
  'Product-launch',
  'Restaurant & Cafe',
  'Retail & Shopping',
  'Self-service',
  'Service provider',
  'Telecom',
  'Tests',
  'University & School',
  'Veterinary Hospital',
  'Waiting Rooms',
] as const;

export type IQueueGroupType = (typeof QueueGroupPossibleTypes)[number];
export const QueueGroupPossibleCountries = Object.keys(
  countries?.countries ?? {},
);

export type IQueueGroupCountry = (typeof QueueGroupPossibleCountries)[number];
