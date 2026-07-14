import React from 'react';
import { Table, Tag, Typography } from 'antd';
import { formatDateTime, formatSom, transactionTypeMeta } from '../../utils/payments';

const { Text } = Typography;

const WalletTransactionsTable = ({ loading, transactions }) => {
  const columns = [
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      render: formatDateTime,
      width: 170,
    },
    {
      title: 'Операция',
      dataIndex: 'type',
      render: (type) => {
        const meta = transactionTypeMeta[type] || transactionTypeMeta.adjustment;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
      width: 170,
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      render: (description) => description || '—',
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      render: (amount) => {
        const positive = Number(amount) > 0;
        return (
          <Text className={positive ? 'tp-money-positive' : 'tp-money-negative'}>
            {positive ? '+' : '−'} {formatSom(Math.abs(Number(amount) || 0))}
          </Text>
        );
      },
      width: 170,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status) => <Tag color={status === 'completed' ? 'green' : 'orange'}>{status === 'completed' ? 'Готово' : status}</Tag>,
      width: 130,
    },
  ];

  return (
    <Table
      className="tp-finance-table"
      columns={columns}
      dataSource={transactions || []}
      loading={loading}
      pagination={{ pageSize: 8 }}
      rowKey="id"
      scroll={{ x: 760 }}
    />
  );
};

export default WalletTransactionsTable;
