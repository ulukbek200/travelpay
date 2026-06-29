import React from 'react';
import { Avatar, Tooltip } from 'antd';
import {
  BankOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
} from '@ant-design/icons';
import './CompanyBadge.css';

const getInitials = (value) =>
  String(value || 'TravelPay Partner')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

const CompanyBadge = ({
  companyName,
  companyLogo,
  companyCity,
  companyVerified,
  size = 'default',
  variant = 'glass',
  className = '',
}) => {
  const safeName = companyName || 'TravelPay Partner';
  const safeCity = companyCity || 'TravelPay Business';

  return (
    <div className={`company-badge company-badge--${size} company-badge--${variant} ${className}`.trim()}>
      <Avatar
        src={companyLogo || undefined}
        size={size === 'compact' ? 34 : 40}
        icon={!companyLogo ? <BankOutlined /> : undefined}
        className="company-badge__avatar"
      >
        {!companyLogo ? getInitials(safeName) : null}
      </Avatar>
      <div className="company-badge__content">
        <div className="company-badge__title-row">
          <span className="company-badge__title">{safeName}</span>
          {companyVerified ? (
            <Tooltip title="Проверенный партнер TravelPay">
              <CheckCircleFilled className="company-badge__check" />
            </Tooltip>
          ) : null}
        </div>
        <span className="company-badge__city">
          <EnvironmentOutlined />
          {safeCity}
        </span>
      </div>
    </div>
  );
};

export default CompanyBadge;
