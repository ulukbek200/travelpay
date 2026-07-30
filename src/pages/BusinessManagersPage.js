import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Modal, Row, Space, Switch, Table, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, CustomerServiceOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AppImage from '../components/AppImage';

const { Title, Paragraph } = Typography;

const emptyManager = {
  firstName: '',
  lastName: '',
  position: 'Менеджер по оплате',
  phone: '',
  whatsapp: '',
  telegram: '',
  email: '',
  workingHours: '09:00–18:00',
  active: true,
  primaryPaymentManager: false,
};

const BusinessManagersPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [managers, setManagers] = useState([]);
  const [editing, setEditing] = useState(null);
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
        <Button icon={<EditOutlined />} onClick={() => openModal(record)}>
          Изменить
        </Button>
      ),
      width: 140,
    },
  ];

  return (
    <main className="tp-business-finance-page">
      <div className="tp-business-finance-shell">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/business/dashboard')} type="text">
          Назад в бизнес-панель
        </Button>

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
            columns={columns}
            dataSource={managers}
            loading={loading}
            rowKey="id"
            scroll={{ x: 920 }}
          />
        </Card>
      </div>

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
