import React from 'react';
import { Button, Card, Select, Space, Tabs, Tag, Typography } from 'antd';
import { ClientAvatar, DataTable, EntityDrawer, EmptyState, Money, PageHeader, SearchInput, StatusBadge, ActivityTimeline } from '../../../components/business/shared';

const { Text, Title } = Typography;

export function ClientsPage({ headerProps, filters, table, drawer }) {
  return <section className="tp-feature-clients-page"><PageHeader eyebrow="Travel CRM" title="Клиенты" {...headerProps} />{filters}{table}{drawer}</section>;
}

export function ClientTable({ clients = [], columns, onOpen, ...rest }) {
  const defaultColumns = columns || [
    { title: 'Клиент', dataIndex: 'name', render: (_, record) => <Space><ClientAvatar client={record} /><span><Text strong>{record.name || record.phone}</Text><br /><Text type="secondary">{record.email || record.phone}</Text></span></Space> },
    { title: 'Телефон', dataIndex: 'phone' },
    { title: 'Бронирований', dataIndex: 'bookingsCount', sorter: (a, b) => Number(a.bookingsCount || 0) - Number(b.bookingsCount || 0) },
    { title: 'Потрачено', dataIndex: 'spent', render: (value) => <Money value={value} />, sorter: (a, b) => Number(a.spent || 0) - Number(b.spent || 0) },
    { title: 'Статус', dataIndex: 'clientStatus', render: (value) => <StatusBadge status={value} /> },
  ];
  return <DataTable columns={defaultColumns} dataSource={clients} onRow={(record) => ({ onDoubleClick: () => onOpen?.(record) })} {...rest} />;
}

export function ClientFilters({ search, onSearch, status, onStatusChange, manager, onManagerChange, managers = [] }) {
  return (
    <div className="tp-feature-client-filters">
      <SearchInput value={search} onChange={onSearch} placeholder="Имя или телефон" />
      <Select value={status} onChange={onStatusChange} style={{ minWidth: 180 }} options={[{ value: 'all', label: 'Все' }, { value: 'new', label: 'Новые' }, { value: 'repeat', label: 'Повторные' }, { value: 'vip', label: 'VIP' }, { value: 'debtors', label: 'Должники' }]} />
      <Select value={manager} onChange={onManagerChange} style={{ minWidth: 180 }} options={[{ value: 'all', label: 'Все менеджеры' }, ...managers.map((item) => ({ value: item.id || item.name, label: item.name }))]} />
    </div>
  );
}

export function ClientDrawer({ client, children, ...props }) {
  return <EntityDrawer title={client ? client.name || client.phone || 'Клиент' : 'Клиент'} width={760} {...props}>{client && (children || <ClientOverview client={client} />)}</EntityDrawer>;
}

export function ClientPage({ client, tabs }) {
  if (!client) return <EmptyState title="Клиент не найден" description="Попробуйте поискать клиента по имени или телефону." />;
  return <section className="tp-feature-client-page"><PageHeader title={client.name || client.phone} description={client.phone} /><Tabs items={tabs} /></section>;
}

export function ClientOverview({ client }) {
  return (
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      <Space><ClientAvatar client={client} size={52} /><div><Title level={4}>{client.name || 'Клиент TravelPay'}</Title><Text type="secondary">{client.phone || client.email}</Text></div></Space>
      <Card size="small"><Money value={client.walletBalance || client.balance || 0} /> <Text type="secondary">баланс TravelPay</Text></Card>
      <ClientTags tags={client.clientTags || client.tags || []} />
    </Space>
  );
}

export function ClientBookings({ bookings = [], columns }) {
  return <DataTable rowKey="key" columns={columns || [{ title: 'Бронь', dataIndex: 'title' }, { title: 'Статус', dataIndex: 'status', render: (value) => <StatusBadge status={value} /> }]} dataSource={bookings} pagination={false} />;
}

export function ClientPayments({ payments = [], columns }) {
  return <DataTable rowKey="key" columns={columns || [{ title: 'Дата', dataIndex: 'date' }, { title: 'Сумма', dataIndex: 'amount', render: (value) => <Money value={value} /> }]} dataSource={payments} pagination={false} />;
}

export function ClientTimeline({ items = [] }) {
  return <ActivityTimeline items={items} empty={<EmptyState title="История клиента пока пуста" description="Бронирования, оплаты и коммуникации появятся здесь автоматически." />} />;
}

export function ClientTags({ tags = [], onChange }) {
  return <Space wrap>{tags.length ? tags.map((tag) => <Tag key={tag} closable={Boolean(onChange)} onClose={() => onChange?.(tags.filter((item) => item !== tag))}>{tag}</Tag>) : <Text type="secondary">Метки не добавлены</Text>}<Button size="small">+ Метка</Button></Space>;
}
