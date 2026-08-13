import React from 'react';
import { Card, Modal, Progress, Space, Tabs, Tag, Typography } from 'antd';
import { DataTable, EmptyState, Money, PageHeader, StatusBadge } from '../../../components/business/shared';

const { Text, Title } = Typography;

export function PropertiesPage({ headerProps, children }) {
  return <section className="tp-feature-properties-page"><PageHeader eyebrow="Property Management" title="Объекты" {...headerProps} />{children}</section>;
}

export function PropertyCard({ property, onOpen }) {
  return (
    <Card className="tp-feature-property-card" hoverable onClick={() => onOpen?.(property)}>
      <Title level={4}>{property.title || property.name}</Title>
      <Text type="secondary">{property.location || property.region}</Text>
      <Space wrap><Tag>{property.type}</Tag><Tag>{property.capacity || 0} гостей</Tag><StatusBadge status={property.status || 'available'} /></Space>
      <div><Text type="secondary">Загрузка</Text><Progress percent={property.occupancy || 0} /></div>
      <Money value={property.pricePerNight || property.price} />
    </Card>
  );
}

export function PropertyPage({ property, tabs }) {
  if (!property) return <EmptyState title="Объект не найден" description="Выберите объект из списка или добавьте новый." />;
  return <section className="tp-feature-property-page"><PageHeader title={property.title || property.name} description={property.location} /><Tabs items={tabs} /></section>;
}

export function PropertyAvailabilityCalendar({ rows = [], columns }) {
  return <DataTable rowKey="id" columns={columns || [{ title: 'Unit', dataIndex: 'title' }]} dataSource={rows} pagination={false} />;
}

export function PropertyPricingCalendar({ prices = [], columns }) {
  return <DataTable rowKey="id" columns={columns || [{ title: 'Дата', dataIndex: 'date' }, { title: 'Цена', dataIndex: 'price', render: (value) => <Money value={value} /> }]} dataSource={prices} pagination={false} />;
}

export function PropertyBookings({ bookings = [], columns }) {
  return <DataTable rowKey="key" columns={columns || [{ title: 'Клиент', dataIndex: 'clientName' }, { title: 'Сумма', dataIndex: 'amount', render: (value) => <Money value={value} /> }]} dataSource={bookings} />;
}

export function PropertySettings({ children }) {
  return <Card className="tp-feature-property-settings">{children}</Card>;
}

export function BlockDatesModal({ open, onCancel, onConfirm, children }) {
  return <Modal open={open} title="Закрыть даты" okText="Закрыть даты" cancelText="Отмена" onCancel={onCancel} onOk={onConfirm}>{children}</Modal>;
}
