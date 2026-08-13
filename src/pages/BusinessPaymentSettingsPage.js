import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Row, Space, Switch, Typography, message } from 'antd';
import { ArrowLeftOutlined, BankOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Title, Paragraph } = Typography;

const BusinessPaymentSettingsPage = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/business/payment-settings')
      .then((response) => {
        form.setFieldsValue(response.data);
      })
      .catch((error) => {
        message.error(error.response?.data?.message || 'Не удалось загрузить реквизиты.');
      })
      .finally(() => setLoading(false));
  }, [form]);

  const submit = async (values) => {
    setSaving(true);
    try {
      const response = await api.put('/business/payment-settings', values);
      form.setFieldsValue(response.data);
      message.success('Реквизиты сохранены.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Не удалось сохранить реквизиты.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={`tp-business-finance-page${embedded ? ' tp-business-finance-page--embedded' : ''}`}>
      <div className="tp-business-finance-shell">
        {!embedded && (
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/business/dashboard')} type="text">
            Назад в бизнес-панель
          </Button>
        )}

        <section className="tp-business-finance-hero">
          <span><BankOutlined /> TravelPay Business</span>
          <Title>Реквизиты и способы оплаты</Title>
          <Paragraph>
            Эти данные показываются клиентам при пополнении баланса. Для каждого платежа TravelPay сохраняет snapshot
            реквизитов, чтобы история оставалась неизменной.
          </Paragraph>
        </section>

        <Card className="tp-business-finance-card" loading={loading}>
          <Form form={form} layout="vertical" onFinish={submit}>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={12}>
                <Form.Item label="Название компании" name="companyName">
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Юридическое название" name="legalName">
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="ИНН" name="taxId">
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Рабочее время" name="workingHours">
                  <Input size="large" placeholder="09:00–18:00" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Контактный email" name="contactEmail">
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Адрес" name="address">
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.List name="methods">
              {(fields, { add, remove }) => (
                <div className="tp-payment-method-editor">
                  <div className="tp-payment-method-editor__head">
                    <Title level={3}>QR-коды и банковские способы</Title>
                    <Button icon={<PlusOutlined />} onClick={() => add({ type: 'qr', active: true })}>
                      Добавить способ
                    </Button>
                  </div>

                  {fields.map((field) => (
                    <Card className="tp-payment-method-editor__card" key={field.key}>
                      <Row gutter={[14, 10]}>
                        <Col xs={24} md={8}>
                          <Form.Item label="Название способа" name={[field.name, 'title']}>
                            <Input placeholder="MBANK" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item label="Банк / кошелёк" name={[field.name, 'bankName']}>
                            <Input placeholder="Optima Bank" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item label="Получатель" name={[field.name, 'recipientName']}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item label="Телефон" name={[field.name, 'phoneNumber']}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item label="Номер карты" name={[field.name, 'cardNumber']}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item label="Номер счёта" name={[field.name, 'accountNumber']}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24}>
                          <Form.Item label="QR image URL / Data URL" name={[field.name, 'qrCodeUrl']}>
                            <Input.TextArea rows={2} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Назначение платежа" name={[field.name, 'paymentPurpose']}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Инструкция" name={[field.name, 'instruction']}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Item label="Активен" name={[field.name, 'active']} valuePropName="checked">
                            <Switch />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Item label="Основной" name={[field.name, 'primary']} valuePropName="checked">
                            <Switch />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Button danger onClick={() => remove(field.name)}>
                            Удалить способ
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              )}
            </Form.List>

            <Space>
              <Button htmlType="submit" icon={<SaveOutlined />} loading={saving} size="large" type="primary">
                Сохранить реквизиты
              </Button>
              <Button onClick={() => navigate('/business/payments')} size="large">
                Платежи на проверке
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </main>
  );
};

export default BusinessPaymentSettingsPage;
