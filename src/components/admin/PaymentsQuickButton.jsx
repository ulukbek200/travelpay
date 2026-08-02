import React from 'react';
import { Badge, Button, Dropdown, Tooltip } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';

export default function PaymentsQuickButton({ pendingCount = 0, onNavigate, compact = false, basePath = '/admin/payments' }) {
  const items = [
    ['all', 'Все оплаты'], ['pending', 'Ожидают подтверждения'], ['successful', 'Успешные'], ['rejected', 'Отклонённые'], ['refunds', 'Возвраты'],
  ].map(([key, label]) => ({ key, label }));
  return <Dropdown menu={{ items, onClick: ({ key }) => onNavigate(`${basePath}${key === 'all' ? '' : `?status=${key}`}`) }} trigger={['click']}>
    <Badge count={pendingCount || 0} size="small" overflowCount={99}><Tooltip title="Оплаты"><Button icon={<CreditCardOutlined />} aria-label={`Оплаты${pendingCount ? `: ${pendingCount} ожидают проверки` : ''}`}>{compact ? null : 'Оплаты'}</Button></Tooltip></Badge>
  </Dropdown>;
}
