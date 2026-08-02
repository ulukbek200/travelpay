import React from 'react';
import Header from '../components/Header';

const PublicLayout = ({ children, withHeader = true }) => (
  <div className="tp-public-layout" data-app-zone="public">
    {withHeader ? <Header /> : null}
    <div className={withHeader ? 'public-layout-shell' : 'tp-public-layout__content'}>{children}</div>
  </div>
);

export default PublicLayout;
