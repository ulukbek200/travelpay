import React, { useEffect, useState } from 'react';
import { Avatar, Button, Card, Checkbox, Col, Drawer, Empty, Form, Input, Modal, Row, Select, Space, Switch, Table, Tabs, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, CustomerServiceOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AppImage from '../components/AppImage';

const { Title, Paragraph } = Typography;

const TEAM_ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner', color: 'gold' },
  { value: 'administrator', label: 'Administrator', color: 'purple' },
  { value: 'manager', label: 'Manager', color: 'blue' },
  { value: 'guide', label: 'Guide', color: 'green' },
  { value: 'driver', label: 'Driver', color: 'cyan' },
  { value: 'accountant', label: 'Accountant', color: 'volcano' },
  { value: 'content_manager', label: 'Content Manager', color: 'magenta' },
];
const getTeamRoleMeta = (role) => TEAM_ROLE_OPTIONS.find((item) => item.value === role) || TEAM_ROLE_OPTIONS[2];
const WORK_DAY_OPTIONS = [
  { value: 'mon', label: 'Пн' },
  { value: 'tue', label: 'Вт' },
  { value: 'wed', label: 'Ср' },
  { value: 'thu', label: 'Чт' },
  { value: 'fri', label: 'Пт' },
  { value: 'sat', label: 'Сб' },
  { value: 'sun', label: 'Вс' },
];
const STAFF_SERVICE_PRESETS = ['Кель-Суу', 'Сон-Куль', 'Ала-Куль', 'Cottages', 'Tours', 'VIP clients', 'Sprinter', 'SUV'];

const emptyManager = {
  firstName: '',
  lastName: '',
  role: 'manager',
  position: 'Менеджер по оплате',
  phone: '',
  whatsapp: '',
  telegram: '',
  email: '',
  workingHours: '09:00–18:00',
  workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  dayOffDates: [],
  vacationDates: [],
  breaks: '',
  services: [],
  vehicleTypes: [],
  files: [],
  notes: '',
  active: true,
  primaryPaymentManager: false,
};

const BusinessManagersPage = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [managers, setManagers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [employeeCard, setEmployeeCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadManagers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/business/managers');
      setManagers(response.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || 'Не удалось загрузить менеджеров.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const openModal = (record = null) => {
    setEditing(record);
    form.setFieldsValue(record || emptyManager);
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing?.id) {
        await api.put(`/business/managers/${editing.id}`, values);
      } else {
        await api.post('/business/managers', values);
      }
      message.success('Менеджер сохранён.');
      setModalOpen(false);
      loadManagers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Не удалось сохранить менеджера.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Менеджер',
      render: (_, record) => (
        <Space>
          <div className="tp-manager-avatar">
            {record.photoUrl ? <AppImage src={record.photoUrl} alt={record.firstName} aspectRatio="1 / 1" /> : <CustomerServiceOutlined />}
          </div>
          <div>
            <strong>{[record.firstName, record.lastName].filter(Boolean).join(' ') || 'Без имени'}</strong>
            <small>{record.position}</small>
          </div>
        </Space>
      ),
    },
    { title: 'Телефон', dataIndex: 'phone', width: 170 },
    {
      title: 'Role',
      render: (_, record) => {
        const meta = getTeamRoleMeta(record.role);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
      width: 160,
      filters: TEAM_ROLE_OPTIONS.map((item) => ({ text: item.label, value: item.value })),
      onFilter: (value, record) => (record.role || 'manager') === value,
    },
    { title: 'WhatsApp', dataIndex: 'whatsapp', width: 170 },
    { title: 'Telegram', dataIndex: 'telegram', width: 160 },
    {
      title: 'Статус',
      render: (_, record) => (
        <Space wrap>
          <Tag color={record.active ? 'green' : 'default'}>{record.active ? 'Активен' : 'Неактивен'}</Tag>
          {record.primaryPaymentManager && <Tag color="gold">Основной</Tag>}
        </Space>
      ),
      width: 190,
    },
    {
      title: '',
      render: (_, record) => (
        <Button icon={<EditOutlined />} onClick={(event) => {
          event.stopPropagation();
          openModal(record);
        }}>
          Изменить
        </Button>
      ),
      width: 140,
    },
  ];

  return (
    <main className={`tp-business-finance-page${embedded ? ' tp-business-finance-page--embedded' : ''}`}>
      <div className="tp-business-finance-shell">
        {!embedded && (
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/business/dashboard')} type="text">
            Назад в бизнес-панель
          </Button>
        )}

        <section className="tp-business-finance-hero">
          <span><CustomerServiceOutlined /> TravelPay Business</span>
          <Title>Менеджеры туристической компании</Title>
          <Paragraph>
            Эти контакты показываются клиентам, когда они выбирают оплату через менеджера.
          </Paragraph>
        </section>

        <Card
          className="tp-business-finance-card"
          extra={<Button icon={<PlusOutlined />} onClick={() => openModal()} type="primary">Добавить менеджера</Button>}
        >
          <Table
            sticky
            size="middle"
            columns={columns}
            dataSource={managers}
            loading={loading}
            rowKey="id"
            scroll={{ x: 920 }}
            onRow={(record) => ({
              onClick: () => setEmployeeCard(record),
            })}
          />
        </Card>
      </div>

      <Drawer
        title={employeeCard ? [employeeCard.firstName, employeeCard.lastName].filter(Boolean).join(' ') || 'Employee' : 'Employee'}
        open={Boolean(employeeCard)}
        onClose={() => setEmployeeCard(null)}
        width={860}
      >
        {employeeCard && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card>
              <Space align="center" size={16}>
                <Avatar size={72} src={employeeCard.photoUrl} icon={<CustomerServiceOutlined />} />
                <div>
                  <Title level={3} style={{ marginBottom: 4 }}>{[employeeCard.firstName, employeeCard.lastName].filter(Boolean).join(' ') || 'Без имени'}</Title>
                  <Space wrap>
                    <Tag color={getTeamRoleMeta(employeeCard.role).color}>{getTeamRoleMeta(employeeCard.role).label}</Tag>
                    <Tag color={employeeCard.active ? 'green' : 'default'}>{employeeCard.active ? 'Активен' : 'Неактивен'}</Tag>
                  </Space>
                  <div style={{ marginTop: 8 }}>
                    <Typography.Text type="secondary">{employeeCard.phone || 'Телефон не указан'} · {employeeCard.email || 'Email не указан'}</Typography.Text>
                  </div>
                </div>
              </Space>
            </Card>
            <Tabs
              items={[
                {
                  key: 'overview',
                  label: 'Обзор',
                  children: (
                    <Row gutter={[12, 12]}>
                      <Col xs={24} md={12}><Card size="small"><Typography.Text type="secondary">Роль</Typography.Text><br /><strong>{getTeamRoleMeta(employeeCard.role).label}</strong></Card></Col>
                      <Col xs={24} md={12}><Card size="small"><Typography.Text type="secondary">Должность</Typography.Text><br /><strong>{employeeCard.position || '—'}</strong></Card></Col>
                      <Col xs={24} md={12}><Card size="small"><Typography.Text type="secondary">Телефон</Typography.Text><br /><strong>{employeeCard.phone || '—'}</strong></Card></Col>
                      <Col xs={24} md={12}><Card size="small"><Typography.Text type="secondary">Email</Typography.Text><br /><strong>{employeeCard.email || '—'}</strong></Card></Col>
                    </Row>
                  ),
                },
                { key: 'bookings', label: 'Бронирования', children: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Связанные бронирования появятся здесь после назначения сотрудника." /> },
                { key: 'tours', label: 'Туры', children: (employeeCard.services || []).length ? <Space wrap>{employeeCard.services.map((item) => <Tag key={item}>{item}</Tag>)}</Space> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Специализации пока не указаны." /> },
                { key: 'tasks', label: 'Задачи', children: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Задачи сотрудника будут отображаться из Business OS Tasks." /> },
                {
                  key: 'schedule',
                  label: 'График',
                  children: (
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      <div><Typography.Text type="secondary">Рабочие дни</Typography.Text><br /><Space wrap>{(employeeCard.workingDays || []).map((day) => <Tag key={day}>{WORK_DAY_OPTIONS.find((item) => item.value === day)?.label || day}</Tag>)}</Space></div>
                      <div><Typography.Text type="secondary">Рабочие часы</Typography.Text><br /><strong>{employeeCard.workingHours || '—'}</strong></div>
                      <div><Typography.Text type="secondary">Выходные</Typography.Text><br /><strong>{(employeeCard.dayOffDates || []).join(', ') || '—'}</strong></div>
                      <div><Typography.Text type="secondary">Отпуск</Typography.Text><br /><strong>{(employeeCard.vacationDates || []).join(', ') || '—'}</strong></div>
                      <div><Typography.Text type="secondary">Перерывы</Typography.Text><br /><strong>{employeeCard.breaks || '—'}</strong></div>
                    </Space>
                  ),
                },
                { key: 'files', label: 'Файлы', children: (employeeCard.files || []).length ? <Space direction="vertical">{employeeCard.files.map((file) => <Typography.Text key={file}>{file}</Typography.Text>)}</Space> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Файлов пока нет." /> },
                { key: 'settings', label: 'Настройки', children: <Button type="primary" icon={<EditOutlined />} onClick={() => openModal(employeeCard)}>Редактировать сотрудника</Button> },
              ]}
            />
          </Space>
        )}
      </Drawer>

      <Modal
        centered
        confirmLoading={saving}
        okText="Сохранить"
        onCancel={() => setModalOpen(false)}
        onOk={submit}
        open={modalOpen}
        title={editing ? 'Редактировать менеджера' : 'Добавить менеджера'}
        width={760}
      >
        <Form form={form} layout="vertical">
          <Row gutter={[14, 10]}>
            <Col xs={24} md={12}>
              <Form.Item label="Имя" name="firstName" rules={[{ required: true, message: 'Введите имя' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Фамилия" name="lastName">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Должность" name="position">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Team role" name="role" rules={[{ required: true, message: 'Select team role' }]}>
                <Select options={TEAM_ROLE_OPTIONS.map(({ value, label }) => ({ value, label }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Фото URL" name="photoUrl">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Телефон" name="phone" rules={[{ required: true, message: 'Введите телефон' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="WhatsApp" name="whatsapp">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Telegram" name="telegram">
                <Input placeholder="@username" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Email" name="email">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="График работы" name="workingHours">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Рабочие дни" name="workingDays">
                <Checkbox.Group options={WORK_DAY_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Выходные / закрытые даты" name="dayOffDates">
                <Select mode="tags" tokenSeparators={[',', ' ']} placeholder="2026-08-12" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Отпуск" name="vacationDates">
                <Select mode="tags" tokenSeparators={[',', ' ']} placeholder="2026-08-20" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Перерывы" name="breaks">
                <Input.TextArea rows={2} placeholder="13:00–14:00 lunch; 17:00 short break" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Services / specialization" name="services">
                <Select mode="tags" tokenSeparators={[',']} options={STAFF_SERVICE_PRESETS.map((value) => ({ value, label: value }))} placeholder="Кель-Суу, Cottages, VIP clients..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Vehicle types" name="vehicleTypes">
                <Select mode="tags" tokenSeparators={[',']} options={['Sprinter', 'SUV', 'Minivan', 'Bus'].map((value) => ({ value, label: value }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Files" name="files">
                <Select mode="tags" tokenSeparators={[',']} placeholder="License.pdf, passport scan..." />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Заметки" name="notes">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Активен" name="active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Основной по оплате" name="primaryPaymentManager" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </main>
  );
};

export default BusinessManagersPage;
