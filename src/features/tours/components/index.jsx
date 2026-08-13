import React from 'react';
import { Button, Card, Checkbox, Drawer, Progress, Space, Tabs, Typography } from 'antd';
import { DataTable, EmptyState, Money, PageHeader, StatusBadge } from '../../../components/business/shared';

const { Text, Title } = Typography;

export function ToursPage({ headerProps, children }) {
  return <section className="tp-feature-tours-page"><PageHeader eyebrow="Tour Operations" title="Туры" {...headerProps} />{children}</section>;
}

export function TourCard({ tour, onOpen }) {
  const capacity = Number(tour.capacity || tour.totalSeats || 0);
  const booked = Number(tour.booked || tour.bookedSeats || 0);
  return (
    <Card className="tp-feature-tour-card" hoverable onClick={() => onOpen?.(tour)}>
      <Title level={4}>{tour.title || tour.name}</Title>
      <Text type="secondary">{tour.location || tour.route}</Text>
      <CapacityIndicator booked={booked} capacity={capacity} />
      <Money value={tour.price} />
      <StatusBadge status={tour.status || tour.calendarStatus || 'scheduled'} />
    </Card>
  );
}

export function TourPage({ tour, tabs }) {
  if (!tour) return <EmptyState title="Тур не найден" description="Выберите тур из списка или создайте новый." />;
  return <section className="tp-feature-tour-page"><PageHeader title={tour.title || tour.name} description={tour.location || tour.route} /><Tabs items={tabs} /></section>;
}

export function DepartureList({ departures = [], onOpen }) {
  return <Space direction="vertical" style={{ width: '100%' }}>{departures.map((departure) => <Button key={departure.id} block onClick={() => onOpen?.(departure)}>{departure.title || departure.startAt} · {departure.booked || 0}/{departure.seats || 0}</Button>)}</Space>;
}

export function DepartureDrawer({ departure, children, ...props }) {
  return <Drawer title={departure?.title || 'Departure'} size={760} {...props}>{children}</Drawer>;
}

export function ParticipantTable({ participants = [], columns }) {
  return <DataTable rowKey="id" columns={columns || [{ title: 'Имя', dataIndex: 'name' }, { title: 'Телефон', dataIndex: 'phone' }, { title: 'Оплата', dataIndex: 'paymentStatus', render: (value) => <StatusBadge status={value} /> }]} dataSource={participants} pagination={false} />;
}

export function CapacityIndicator({ booked = 0, capacity = 0 }) {
  const percent = capacity ? Math.min(Math.round((Number(booked) / Number(capacity)) * 100), 100) : 0;
  return <div className="tp-feature-capacity"><Text>{booked} / {capacity}</Text><Progress percent={percent} size="small" status={percent >= 100 ? 'exception' : 'normal'} /></div>;
}

export function TourChecklist({ items = [], checked = {}, onChange }) {
  return <Space direction="vertical">{items.map((item) => <Checkbox key={item.key} checked={Boolean(checked[item.key])} onChange={(event) => onChange?.(item.key, event.target.checked)}>{item.label}</Checkbox>)}</Space>;
}
