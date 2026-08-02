import React from 'react';
import UserSidebar from './UserSidebar';

const UserLayout = ({ children }) => (
  <div className="tp-user-layout" data-app-zone="user">
    <UserSidebar />
    <main className="tp-user-layout__content" aria-label="Личный кабинет">
      {children}
    </main>
  </div>
);

export default UserLayout;
