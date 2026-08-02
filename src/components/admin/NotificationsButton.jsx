import React, { useState } from 'react';
import { Badge, Button, Tooltip } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import NotificationsDrawer from './NotificationsDrawer';

export default function NotificationsButton(props) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const unread = (props.notifications || []).filter((item) => !item.read).length;
  const label = `\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f${unread ? `: ${unread} \u043d\u043e\u0432\u044b\u0445` : ''}`;

  return <>
    <Tooltip title="\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f">
      <Badge count={unread || 0} size="small" overflowCount={99}>
        <Button shape="circle" icon={<BellOutlined />} aria-label={label} onClick={() => { setShowAll(false); setOpen(true); }} />
      </Badge>
    </Tooltip>
    <NotificationsDrawer {...props} open={open} showAll={showAll} onViewAll={() => setShowAll(true)} onClose={() => setOpen(false)} />
  </>;
}
