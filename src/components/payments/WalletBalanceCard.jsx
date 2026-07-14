import React from 'react';
import { Button, Card, Col, Row, Statistic } from 'antd';
import { HistoryOutlined, PlusOutlined, SafetyCertificateOutlined, WalletOutlined } from '@ant-design/icons';
import { formatSom } from '../../utils/payments';

const WalletBalanceCard = ({ loading, onHistoryClick, onTopUpClick, wallet }) => {
  const available = Number(wallet?.availableBalance || 0);
  const reserved = Number(wallet?.reservedBalance || 0);
  const bonus = Number(wallet?.bonusBalance || 0);

  return (
    <Card className="tp-wallet-hero-card" loading={loading}>
      <div className="tp-wallet-hero-card__top">
        <div>
          <span className="tp-wallet-kicker"><WalletOutlined /> Мои накопления</span>
          <h1>Доступный баланс</h1>
          <strong>{formatSom(available)}</strong>
        </div>
        <div className="tp-wallet-hero-card__seal">
          <SafetyCertificateOutlined />
          <span>Средства меняются только через серверные операции</span>
        </div>
      </div>

      <Row gutter={[14, 14]} className="tp-wallet-stat-grid">
        <Col xs={24} md={8}>
          <Statistic title="Бонусы" value={bonus} suffix="сом" />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Зарезервировано" value={reserved} suffix="сом" />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Всего в кошельке" value={available + reserved + bonus} suffix="сом" />
        </Col>
      </Row>

      <div className="tp-wallet-hero-card__actions">
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={onTopUpClick}>
          Пополнить баланс
        </Button>
        <Button size="large" icon={<HistoryOutlined />} onClick={onHistoryClick}>
          История операций
        </Button>
      </div>
    </Card>
  );
};

export default WalletBalanceCard;
