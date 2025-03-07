import { Application as ExpressFeathers } from '@feathersjs/express';

// A mapping of service names to types. Will be extended in service files.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes> & {
  getService<L extends keyof ServiceTypes>(location: L): ServiceTypes[L];
  getServicePath<L extends keyof ServiceTypes>(location: L): string;
  declareService<L extends keyof ServiceTypes>(location: L, service: any): ServiceTypes[L];
};
