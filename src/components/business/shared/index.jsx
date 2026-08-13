import React from 'react';
import {
  Alert,
  Avatar,
  Button,
  DatePicker,
  Drawer,
  Empty,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  ExclamationCircleOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { formatBusinessDate, formatBusinessDateTime, formatBusinessTime } from '../../../utils/dateTime';

const { Text, Title, Paragraph } = Typography;
const safeSrc = (value) => String(value || '').trim() || null;

const statusColors = {
  NEW: 'blue',
  PENDING: 'gold',
  CONFIRMED: 'green',
  AWAITING_PAYMENT: 'gold',
  PARTIALLY_PAID: 'cyan',
  PAID: 'green',
  IN_PROGRESS: 'blue',
  COMPLETED: 'default',
  CANCELLED: 'red',
  NO_SHOW: 'volcano',
  RESCHEDULED: 'purple',
  CHECKED_IN: 'green',
  CHECKED_OUT: 'default',
  active: 'green',
  inactive: 'default',
  blocked: 'red',
  draft: 'default',
};

const paymentColors = {
  UNPAID: 'default',
  PARTIALLY_PAID: 'cyan',
  PAID: 'green',
  REFUNDED: 'purple',
  PARTIALLY_REFUNDED: 'purple',
  unpaid: 'default',
  paid: 'green',
  refunded: 'purple',
};

const labelize = (value) => String(value || '—')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (char) => char.toUpperCase());

export function StatusBadge({ status, label, color, dot = true }) {
  const safeStatus = status || 'NEW';
  return (
    <Tag color={color || statusColors[safeStatus] || statusColors[String(safeStatus).toUpperCase()] || 'blue'} className="tp-shared-status-badge">
      {dot && <span className="tp-shared-status-badge__dot" aria-hidden="true" />}
      {label || labelize(safeStatus)}
    </Tag>
  );
}

export function PaymentBadge({ status, label, dot = true }) {
  const safeStatus = status || 'UNPAID';
  return (
    <Tag color={paymentColors[safeStatus] || paymentColors[String(safeStatus).toUpperCase()] || 'default'} className="tp-shared-status-badge">
      {dot && <span className="tp-shared-status-badge__dot" aria-hidden="true" />}
      {label || labelize(safeStatus)}
    </Tag>
  );
}

export function Money({ value = 0, currency = 'сом', empty = '—' }) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return empty;
  return <span className="tp-shared-money">{number.toLocaleString('ru-RU')} {currency}</span>;
}

export function DateTime({ value, mode = 'datetime', empty = '—' }) {
  if (!value) return empty;
  if (mode === 'date') return formatBusinessDate(value);
  if (mode === 'time') return formatBusinessTime(value);
  return formatBusinessDateTime(value);
}

export function UserAvatar({ user, name, size = 34 }) {
  const displayName = name || user?.name || user?.fullName || user?.email || 'U';
  return <Avatar size={size} src={safeSrc(user?.avatar || user?.photo)} icon={<UserOutlined />}>{String(displayName).slice(0, 1).toUpperCase()}</Avatar>;
}

export function ClientAvatar({ client, size = 34 }) {
  return <UserAvatar user={client} name={client?.name || client?.fullName || client?.phone} size={size} />;
}

export function EmptyState({ title = 'Пока здесь пусто', description, actionText, onAction, icon }) {
  return (
    <Empty image={icon || Empty.PRESENTED_IMAGE_SIMPLE} description={(
      <Space orientation="vertical" size={4}>
        <Text strong>{title}</Text>
        {description && <Text type="secondary">{description}</Text>}
      </Space>
    )}>
      {actionText && onAction ? <Button type="primary" onClick={onAction}>{actionText}</Button> : null}
    </Empty>
  );
}

export function ErrorState({ title = 'Что-то пошло не так', description, status, onRetry }) {
  const friendly = status === 403
    ? 'У вас нет доступа к этому разделу.'
    : status === 409
      ? 'Этот объект уже занят на выбранные даты.'
      : description;
  return (
    <Alert
      type="error"
      showIcon
      title={title}
      description={friendly}
      action={onRetry ? <Button size="small" onClick={onRetry}>Повторить</Button> : null}
    />
  );
}

export function PageHeader({ eyebrow, title, description, actions, extra }) {
  return (
    <div className="tp-shared-page-header">
      <div>
        {eyebrow && <Text className="tp-admin-section-label">{eyebrow}</Text>}
        <Title level={2}>{title}</Title>
        {description && <Paragraph type="secondary">{description}</Paragraph>}
      </div>
      {(actions || extra) && <Space wrap>{actions}{extra}</Space>}
    </div>
  );
}

export function DataTable({ columns, dataSource, rowKey = 'id', loading, pagination, searchSlot, filterSlot, actionsSlot, ...rest }) {
  return (
    <div className="tp-shared-data-table">
      {(searchSlot || filterSlot || actionsSlot) && (
        <FilterBar search={searchSlot} filters={filterSlot} actions={actionsSlot} />
      )}
      <Table
        sticky
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination ?? { pageSize: 8, showSizeChanger: false }}
        {...rest}
      />
    </div>
  );
}

export function FilterBar({ search, filters, actions }) {
  return (
    <div className="tp-shared-filter-bar">
      {search}
      <Space wrap>{filters}</Space>
      <Space wrap>{actions}</Space>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Поиск', allowClear = true, ...rest }) {
  return (
    <Input.Search
      allowClear={allowClear}
      prefix={<SearchOutlined />}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange?.(event.target.value, event)}
      {...rest}
    />
  );
}

export function EntityDrawer({ title, open, onClose, width = 720, size, extra, children, footer, ...rest }) {
  return (
    <Drawer
      destroyOnHidden
      forceRender
      title={title}
      open={open}
      onClose={onClose}
      size={size ?? width}
      extra={extra}
      footer={footer}
      className="tp-shared-entity-drawer"
      {...rest}
    >
      {children}
    </Drawer>
  );
}

export function ConfirmDialog({ open, title, description, okText = 'Подтвердить', cancelText = 'Отмена', danger, loading, onConfirm, onCancel }) {
  return (
    <Modal
      centered
      open={open}
      title={<Space><ExclamationCircleOutlined />{title}</Space>}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ danger }}
      confirmLoading={loading}
      onOk={onConfirm}
      onCancel={onCancel}
    >
      {description && <Paragraph>{description}</Paragraph>}
    </Modal>
  );
}

export function ActivityTimeline({ items = [], empty, renderItem }) {
  if (!items.length) {
    return empty || <EmptyState title="История пока пуста" description="Действия команды появятся здесь автоматически." />;
  }

  return (
    <div className="tp-shared-activity-timeline">
      {items.map((item, index) => (
        <div key={item.id || item.key || index} className={`tp-shared-activity-timeline__item is-${item.tone || item.type || 'info'}`}>
          <div className="tp-shared-activity-timeline__rail">
            <span />
            {index < items.length - 1 ? <i /> : null}
          </div>
          <div className="tp-shared-activity-timeline__content">
            {renderItem ? renderItem(item) : (
              <>
                <div className="tp-shared-activity-timeline__head">
                  <Text strong>{item.title}</Text>
                  {item.date && <Text type="secondary"><DateTime value={item.date} /></Text>}
                </div>
                {item.description && <Text type="secondary">{item.description}</Text>}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export { DatePicker };
