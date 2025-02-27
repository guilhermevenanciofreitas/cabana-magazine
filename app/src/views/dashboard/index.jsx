import React from 'react';
import { Panel } from 'rsuite';
import Dashboard from './Dashboard';
import Copyright from '../../components/Copyright';
import PageToolbar from '../../components/PageToolbar';
import { CustomBreadcrumb } from '../../controls';

const Page = () => {
  return (
    <Panel header={<CustomBreadcrumb title={'TCL Transporte'} />}>
      {/*
      <PageToolbar />
      <Dashboard />
      <Copyright />
      */}
    </Panel>
  );
};

export default Page;
