import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  BankOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
} from '@ant-design/icons';
import AppImage from './AppImage';
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
  companyId,
  size = 'default',
  variant = 'glass',
  className = '',
}) => {
  const navigate = useNavigate();
  const safeName = companyName || 'TravelPay Partner';
  const safeCity = companyCity || 'TravelPay Business';

  return (
    <div
      className={`company-badge company-badge--${size} company-badge--${variant} ${companyId ? 'company-badge--link' : ''} ${className}`.trim()}
      role={companyId ? 'link' : undefined}
      tabIndex={companyId ? 0 : undefined}
      onClick={(event) => {
        if (!companyId) return;
        event.stopPropagation();
        navigate(`/companies/${companyId}`);
      }}
      onKeyDown={(event) => {
        if (companyId && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          event.stopPropagation();
          navigate(`/companies/${companyId}`);
        }
      }}
    >
      <Avatar
        size={size === 'compact' ? 34 : 40}
        icon={!companyLogo ? <BankOutlined /> : undefined}
        className="company-badge__avatar"
      >
        {companyLogo ? <AppImage src={companyLogo} alt={`${safeName} logo`} aspectRatio="1 / 1" /> : getInitials(safeName)}
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
