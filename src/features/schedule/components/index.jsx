import React from 'react';
import { Button, Card, Drawer, Empty, Modal, Segmented, Space, Tag, Typography } from 'antd';
import { LeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { DateTime, EntityDrawer, PaymentBadge, StatusBadge } from '../../../components/business/shared';
import { formatBusinessTime } from '../../../utils/dateTime';

const { Text, Title } = Typography;

export function SchedulePage({ header, toolbar, children }) {
  return <section className="tp-feature-schedule-page">{header}{toolbar}<div className="tp-feature-schedule-page__body">{children}</div></section>;
}

export function ScheduleHeader({ title = 'Расписание', dateLabel, onToday, onPrev, onNext, actions }) {
  return (
    <div className="tp-feature-schedule-header">
      <div>
        <Title level={2}>{title}</Title>
        {dateLabel && <Text type="secondary">{dateLabel}</Text>}
      </div>
      <Space wrap>
        <Button onClick={onToday}>Сегодня</Button>
        <Button icon={<LeftOutlined />} onClick={onPrev} />
        <Button icon={<RightOutlined />} onClick={onNext} />
        {actions}
      </Space>
    </div>
  );
}

export function ScheduleToolbar({ view, onViewChange, groupBy, onGroupByChange, search, filters, onCreate }) {
  return (
    <div className="tp-feature-schedule-toolbar">
      {search}
      <Segmented value={view} onChange={onViewChange} options={[{ label: 'День', value: 'day' }, { label: 'Неделя', value: 'week' }, { label: 'Месяц', value: 'month' }]} />
      {groupBy && <Segmented value={groupBy} onChange={onGroupByChange} options={[{ label: 'Объекты', value: 'resources' }, { label: 'Туры', value: 'tours' }, { label: 'Менеджеры', value: 'managers' }]} />}
      {filters}
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>Бронирование</Button>
    </div>
  );
}

export function DayView({ children, empty }) {
  return <div className="tp-feature-day-view">{children || empty || <Empty description="На выбранный день событий нет" />}</div>;
}

export function WeekView({ days = [], renderDay }) {
  return <div className="tp-feature-week-view">{days.map((day) => <div key={day.key || day.date} className="tp-feature-week-view__day">{renderDay?.(day)}</div>)}</div>;
}

export function MonthView({ days = [], renderDay }) {
  return <div className="tp-feature-month-view">{days.map((day) => <button key={day.key || day.date} type="button" className="tp-feature-month-view__day" onClick={day.onClick}>{renderDay?.(day) || day.label}</button>)}</div>;
}

export function TimeGrid({ hours = [], resources = [], renderSlot, renderEvent }) {
  return (
    <div className="tp-feature-time-grid" style={{ gridTemplateColumns: `72px repeat(${Math.max(resources.length, 1)}, minmax(180px, 1fr))` }}>
      <div />
      {resources.map((resource) => <ResourceHeader key={resource.key || resource.id} resource={resource} />)}
      {hours.map((hour) => (
        <React.Fragment key={hour}>
          <time>{String(hour).padStart(2, '0')}:00</time>
          {resources.map((resource) => renderSlot?.({ hour, resource }) || <div key={`${resource.key || resource.id}-${hour}`} />)}
        </React.Fragment>
      ))}
      {resources.flatMap((resource) => (resource.events || []).map((event) => renderEvent?.(event, resource) || <BookingEvent key={event.key || event.id} booking={event} />))}
    </div>
  );
}

export function ResourceHeader({ resource }) {
  return <div className="tp-feature-resource-header"><strong>{resource.label || resource.title}</strong>{resource.subtitle && <small>{resource.subtitle}</small>}</div>;
}

export function BookingEvent({ booking, onClick }) {
  const endTime = booking.endDate ? formatBusinessTime(booking.endDate) : '';
  return (
    <button type="button" className={`tp-feature-booking-event is-${booking.status || 'new'}`} onClick={() => onClick?.(booking)}>
      <Text type="secondary"><DateTime value={booking.startDate || booking.bookingDate} mode="time" /> {endTime ? `– ${endTime}` : ''}</Text>
      <strong>{booking.title || booking.tourTitle || booking.stayTitle}</strong>
      <small>{[booking.clientName, booking.people || booking.guests ? `${booking.people || booking.guests} гостей` : ''].filter(Boolean).join(' · ')}</small>
      <StatusBadge status={booking.status} label={booking.statusLabel} />
    </button>
  );
}

export function CurrentTimeIndicator({ label, top }) {
  return <span className="tp-feature-current-time" style={{ top }}><i />{label && <small>{label}</small>}</span>;
}

export function CreateBookingDrawer(props) {
  return <EntityDrawer title="Новое бронирование" width={760} {...props} />;
}

export function BookingDrawer({ booking, ...props }) {
  return (
    <EntityDrawer title={booking ? `#TRP-${String(booking.id || 0).padStart(4, '0')}` : 'Бронирование'} width={720} {...props}>
      {booking && <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <StatusBadge status={booking.status} />
        <Title level={4}>{booking.clientName || 'Клиент'}</Title>
        <Text>{booking.clientPhone || booking.clientEmail}</Text>
        <PaymentBadge status={booking.paymentStatus} />
        {props.children}
      </Space>}
    </EntityDrawer>
  );
}

export function AvailabilityIndicator({ available, label, detail }) {
  return <Tag color={available ? 'green' : 'red'}>{label || (available ? 'Доступно' : 'Занято')}{detail ? ` · ${detail}` : ''}</Tag>;
}

export function ConflictDialog({ open, conflict, alternatives = [], onCancel, onSelectAlternative }) {
  return (
    <Modal open={open} title="Конфликт бронирования" footer={null} onCancel={onCancel}>
      <Card size="small">
        <Text strong>{conflict?.title || 'Объект уже занят'}</Text>
        {conflict?.time && <div><Text type="secondary">{conflict.time}</Text></div>}
      </Card>
      <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
        {alternatives.map((item) => <Button key={item.id} block onClick={() => onSelectAlternative?.(item)}>{item.title || item.name}</Button>)}
      </Space>
    </Modal>
  );
}

export { Drawer };
