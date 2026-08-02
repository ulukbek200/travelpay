import React from 'react';

const AdminLayout = ({ children }) => (
  <main className="tp-admin-route-layout" data-app-zone="admin" aria-label="Панель администратора">
    {children}
  </main>
);

export default AdminLayout;
