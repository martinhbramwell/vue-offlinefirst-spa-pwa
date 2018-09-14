import { accessGroups as AdminAccessGroups } from './Admin';
import { accessGroups as SalesAccessGroups } from './Sales';
import { accessGroups as TestAccessGroups } from './Tests';
import { accessGroups as DistributorAccessGroups } from './Distributor';

export const accessGroups = Object.assign( // eslint-disable-line import/prefer-default-export
  {},
  AdminAccessGroups,
  SalesAccessGroups,
  TestAccessGroups,
  DistributorAccessGroups,
);
