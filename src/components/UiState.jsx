import React from 'react';
import { Button, Empty, Skeleton } from 'antd';

export const ContentSkeleton = ({ rows = 3, cards = 3, className = '' }) => (
  <div className={`tp-content-skeleton ${className}`.trim()} aria-label="Загрузка" aria-busy="true">
    {Array.from({ length: cards }, (_, index) => (
      <div className="tp-content-skeleton__card" key={index}>
        <Skeleton active title={{ width: '58%' }} paragraph={{ rows }} />
      </div>
    ))}
  </div>
);

export const EmptyState = ({ title = 'Пока здесь пусто', description, actionText, onAction, className = '' }) => (
  <div className={`tp-empty-state ${className}`.trim()}>
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<><strong>{title}</strong>{description ? <span>{description}</span> : null}</>}>
      {actionText && onAction ? <Button type="primary" onClick={onAction}>{actionText}</Button> : null}
    </Empty>
  </div>
);
