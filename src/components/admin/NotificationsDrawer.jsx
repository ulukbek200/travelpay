import React from 'react';
import { Button, Drawer, Empty, List, Skeleton, Space, Tag, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function NotificationsDrawer({ open, onClose, notifications = [], loading, error, onMarkRead, onViewAll, mobile, showAll = false }) {
  const visibleNotifications = showAll ? notifications : notifications.slice(0, 7);
  return <Drawer title="\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f" open={open} onClose={onClose} width={mobile ? '100%' : 420} className="admin-notifications-drawer">
    {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : error ? <Empty description={error} /> : notifications.length ? <>
      <List dataSource={visibleNotifications} renderItem={(item) => <List.Item actions={!item.read ? [<Button key="read" type="text" size="small" icon={<CheckOutlined />} onClick={() => onMarkRead(item.id)}>\u041f\u0440\u043e\u0447\u0438\u0442\u0430\u043d\u043e</Button>] : []}>
        <List.Item.Meta title={<Space size={6}><strong>{item.title || '\u041d\u043e\u0432\u043e\u0435 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435'}</strong>{!item.read && <Tag color="blue">\u041d\u043e\u0432\u043e\u0435</Tag>}</Space>} description={<><Text>{item.description || item.message || '\u0415\u0441\u0442\u044c \u043d\u043e\u0432\u043e\u0435 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435.'}</Text><br /><Text type="secondary">{item.createdAt ? new Date(item.createdAt).toLocaleString('ru-RU') : ''}</Text></>} />
      </List.Item>} />
      {!showAll && notifications.length > 7 && <Button block onClick={onViewAll}>\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0432\u0441\u0435</Button>}
    </> : <Empty description="\u041d\u043e\u0432\u044b\u0445 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0439 \u043d\u0435\u0442" />}
  </Drawer>;
}
