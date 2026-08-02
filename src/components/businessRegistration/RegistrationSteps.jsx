import React from 'react';
import { Button, Card, Col, Form, Input, Row, Select, Space, Tag, Upload } from 'antd';
import { CheckCircleFilled, DeleteOutlined, InboxOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { BUSINESS_MONTHLY_PLAN_ID, findCottagePlan, formatPlanPrice, isSelfServiceCottagePlan } from '../../config/businessPricing';

const Field = ({ name, label, children, rules, hint }) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message;
  return <Form.Item label={label} validateStatus={error ? 'error' : undefined} help={error || hint} hasFeedback>
    {React.cloneElement(children, { ...register(name, rules), status: error ? 'error' : undefined, 'aria-invalid': Boolean(error) })}
  </Form.Item>;
};

const passwordRule = (value) => /(?=.*[a-zA-Z])(?=.*\d).{8,}/.test(value) || 'Минимум 8 символов: буквы и цифры.';
const countryOptions = [{ value: '+996', label: 'Кыргызстан +996' }, { value: '+7', label: 'Казахстан / Россия +7' }, { value: '+998', label: 'Узбекистан +998' }, { value: '+992', label: 'Таджикистан +992' }];
const categoryOptions = ['Туроператор', 'Туристическая компания', 'Отель', 'Гостевой дом', 'Коттедж', 'База отдыха', 'Гид', 'Транспорт', 'Другое'].map((value) => ({ value, label: value }));
const paymentOptions = ['QR', 'MBank', 'Элкарт', 'Бакай', 'DemirBank', 'Optima', 'Банковский счет'].map((value) => ({ value, label: value }));
const uploadProps = { beforeUpload: () => false, maxCount: 1, accept: '.png,.jpg,.jpeg,.webp,.pdf' };

export function StepAccount() {
  const { getValues } = useFormContext();
  return <StepCard title="Создайте аккаунт" note="Email будет использоваться для входа в кабинет компании."><Row gutter={16}><Col xs={24}><Field name="email" label="Рабочий email" rules={{ required: 'Введите email', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Проверьте формат email.' } }}><Input size="large" autoComplete="email" /></Field></Col><Col xs={24} md={12}><Field name="password" label="Пароль" rules={{ required: 'Создайте пароль', validate: passwordRule }} hint="Не менее 8 символов, буквы и цифры."><Input.Password size="large" prefix={<LockOutlined />} autoComplete="new-password" /></Field></Col><Col xs={24} md={12}><Field name="confirmPassword" label="Повторите пароль" rules={{ required: 'Повторите пароль', validate: (value) => value === getValues('password') || 'Пароли не совпадают.' }}><Input.Password size="large" prefix={<LockOutlined />} autoComplete="new-password" /></Field></Col></Row></StepCard>;
}

export function StepPersonal() {
  const { control } = useFormContext();
  return <StepCard title="Расскажите о себе" note="Эти данные увидит команда TravelPay при проверке заявки."><Row gutter={16}><Col xs={24} md={12}><Field name="firstName" label="Имя" rules={{ required: 'Введите имя' }}><Input size="large" autoComplete="given-name" /></Field></Col><Col xs={24} md={12}><Field name="lastName" label="Фамилия" rules={{ required: 'Введите фамилию' }}><Input size="large" autoComplete="family-name" /></Field></Col><Col xs={24} md={12}><Controller control={control} name="countryCode" rules={{ required: 'Выберите код страны' }} render={({ field, fieldState }) => <Form.Item label="Страна и код" validateStatus={fieldState.error ? 'error' : undefined} help={fieldState.error?.message}><Select {...field} size="large" options={countryOptions} /></Form.Item>} /></Col><Col xs={24} md={12}><Field name="phone" label="Номер телефона" rules={{ required: 'Введите номер', pattern: { value: /^[0-9\s()-]{6,}$/, message: 'Проверьте номер телефона.' } }}><Input size="large" inputMode="tel" placeholder="555 123 456" /></Field></Col><Col xs={24}><Field name="personalTelegram" label="Telegram (необязательно)"><Input size="large" placeholder="@username" /></Field></Col><Col xs={24}><UploadField control={control} name="profilePhoto" label="Фото профиля (необязательно)" /></Col></Row></StepCard>;
}

export function StepCompany() {
  const { control } = useFormContext();
  return <StepCard title="Данные компании" note="Эти сведения формируют публичный профиль после одобрения."><Row gutter={16}><Col xs={24}><UploadField control={control} name="logo" label="Логотип компании" required /></Col><Col xs={24} md={12}><Field name="companyName" label="Название" rules={{ required: 'Введите название компании' }}><Input size="large" /></Field></Col><Col xs={24} md={12}><Controller control={control} name="category" rules={{ required: 'Выберите категорию' }} render={({ field, fieldState }) => <Form.Item label="Категория" validateStatus={fieldState.error ? 'error' : undefined} help={fieldState.error?.message}><Select {...field} size="large" options={categoryOptions} placeholder="Выберите категорию" /></Form.Item>} /></Col><Col xs={24}><Field name="description" label="Краткое описание" rules={{ required: 'Опишите компанию', minLength: { value: 30, message: 'Минимум 30 символов.' } }}><Input.TextArea rows={4} maxLength={500} showCount /></Field></Col><Col xs={24} md={12}><Field name="address" label="Адрес" rules={{ required: 'Введите адрес' }}><Input size="large" /></Field></Col><Col xs={24} md={12}><Field name="region" label="Регион" rules={{ required: 'Введите регион' }}><Input size="large" placeholder="Например, Иссык-Кульская область" /></Field></Col><Col xs={24} md={12}><Field name="website" label="Сайт (необязательно)" rules={{ pattern: { value: /^(https?:\/\/)?[^\s.]+\.[^\s]+$/i, message: 'Укажите корректный адрес сайта.' } }}><Input size="large" placeholder="https://company.kg" /></Field></Col><Col xs={24} md={12}><Field name="companyEmail" label="Email компании" rules={{ required: 'Введите email компании', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Проверьте формат email.' } }}><Input size="large" /></Field></Col></Row></StepCard>;
}

export function StepContacts() {
  return <StepCard title="Контакты для клиентов" note="Укажите способ, по которому менеджер быстрее всего ответит клиенту."><Row gutter={16}><Col xs={24} md={12}><Field name="whatsapp" label="WhatsApp" rules={{ required: 'Введите WhatsApp' }}><Input size="large" inputMode="tel" /></Field></Col><Col xs={24} md={12}><Field name="managerPhone" label="Телефон менеджера" rules={{ required: 'Введите телефон менеджера' }}><Input size="large" inputMode="tel" /></Field></Col><Col xs={24} md={12}><Field name="telegram" label="Telegram (необязательно)"><Input size="large" placeholder="@company" /></Field></Col><Col xs={24} md={12}><Field name="instagramUrl" label="Instagram" rules={{ required: 'Добавьте Instagram', pattern: { value: /^https?:\/\//i, message: 'Ссылка должна начинаться с https://.' } }}><Input size="large" placeholder="https://instagram.com/company" /></Field></Col><Col xs={24} md={12}><Field name="facebookUrl" label="Facebook (необязательно)" rules={{ pattern: { value: /^$|^https?:\/\//i, message: 'Ссылка должна начинаться с https://.' } }}><Input size="large" /></Field></Col><Col xs={24} md={12}><Field name="workingHours" label="Рабочее время" rules={{ required: 'Укажите рабочее время' }}><Input size="large" placeholder="Пн–Сб, 09:00–18:00" /></Field></Col></Row></StepCard>;
}

export function StepPayments() {
  const { control, register, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'paymentMethods' });
  return <StepCard title="Способы оплаты" note="Добавьте реквизиты, которые будут доступны клиентам после одобрения."><div className="business-payment-list">{fields.map((item, index) => <Card size="small" key={item.id}><Row gutter={12}><Col xs={24} md={7}><Controller control={control} name={`paymentMethods.${index}.type`} rules={{ required: 'Выберите способ' }} render={({ field }) => <Form.Item label="Способ"><Select {...field} options={paymentOptions} /></Form.Item>} /></Col><Col xs={24} md={8}><Form.Item label="Получатель" validateStatus={errors.paymentMethods?.[index]?.recipient ? 'error' : undefined} help={errors.paymentMethods?.[index]?.recipient?.message}><Input {...register(`paymentMethods.${index}.recipient`, { required: 'Укажите получателя' })} /></Form.Item></Col><Col xs={20} md={7}><Form.Item label="Номер счёта / телефона" validateStatus={errors.paymentMethods?.[index]?.account ? 'error' : undefined} help={errors.paymentMethods?.[index]?.account?.message}><Input {...register(`paymentMethods.${index}.account`, { required: 'Укажите реквизит' })} /></Form.Item></Col><Col xs={4} md={2}><Button danger type="text" aria-label="Удалить способ оплаты" icon={<DeleteOutlined />} onClick={() => remove(index)} /></Col></Row></Card>)}</div><Button icon={<PlusOutlined />} onClick={() => append({ type: 'QR', recipient: '', account: '' })}>Добавить способ оплаты</Button></StepCard>;
}

export function StepDocuments() {
  const { control } = useFormContext();
  return <StepCard title="Документы и фотографии" note="Поддерживаются PNG, JPG, JPEG, WEBP и PDF. Максимальный размер одного файла — 12 МБ."><Row gutter={16}><Col xs={24} md={12}><UploadField control={control} name="passport" label="Паспорт владельца" required /></Col><Col xs={24} md={12}><UploadField control={control} name="receipt" label="Чек оплаты подписки" required /></Col><Col xs={24}><UploadField control={control} name="documents" label="Лицензия, регистрационные документы, сертификаты, фото офиса" multiple /></Col></Row></StepCard>;
}

export function StepReview() {
  const { getValues } = useFormContext(); const v = getValues();
  const requestedPlan = findCottagePlan(v.selectedPlanId);
  const selectedPlan = isSelfServiceCottagePlan(requestedPlan)
    ? requestedPlan
    : findCottagePlan(BUSINESS_MONTHLY_PLAN_ID);
  return <StepCard title="Проверьте заявку" note="Нажмите на «Назад», чтобы изменить нужный раздел."><div className="business-review-grid"><Review title="Личные данные" values={[`${v.firstName || ''} ${v.lastName || ''}`, `${v.countryCode || ''} ${v.phone || ''}`, v.email]} /><Review title="Компания" values={[v.companyName, v.category, v.region, v.address]} /><Review title="Контакты" values={[v.whatsapp, v.instagramUrl, v.workingHours]} /><Review title="Реквизиты" values={[`${safeArray(v.paymentMethods).length} способ(а) оплаты`]} /><Review title="Документы" values={[v.passport?.[0]?.name || '—', v.receipt?.[0]?.name || '—', `${safeArray(v.documents).length} дополнительных`]} /><Review title="Выбранный тариф" values={[selectedPlan?.name || 'TravelPay Business', selectedPlan ? `${formatPlanPrice(selectedPlan)}${selectedPlan.monthlyPrice ? ' за 30 дней доступа' : ''}` : 'Условия уточняются отдельно', 'Списание происходит только после отдельного подтверждения.']} /></div><Controller control={useFormContext().control} name="agreement" rules={{ validate: (value) => value || 'Подтвердите согласие.' }} render={({ field, fieldState }) => <Form.Item validateStatus={fieldState.error ? 'error' : undefined} help={fieldState.error?.message}><label className="business-agreement"><input type="checkbox" checked={Boolean(field.value)} onChange={field.onChange} /> Я принимаю условия TravelPay Business и обработку данных.</label></Form.Item>} /></StepCard>;
}

function Review({ title, values }) { return <Card size="small"><Space direction="vertical" size={4}><Tag icon={<CheckCircleFilled />} color="success">{title}</Tag>{values.filter(Boolean).map((value, index) => <span key={index}>{value}</span>)}</Space></Card>; }
function StepCard({ title, note, children }) { return <Card className="business-register-card"><h2>{title}</h2><p>{note}</p>{children}</Card>; }
function safeArray(value) { return Array.isArray(value) ? value : []; }
function UploadField({ control, name, label, required, multiple }) { return <Controller control={control} name={name} rules={required ? { validate: (value) => safeArray(value).length > 0 || `Загрузите: ${label}` } : undefined} render={({ field, fieldState }) => <Form.Item label={label} validateStatus={fieldState.error ? 'error' : undefined} help={fieldState.error?.message}><Upload.Dragger {...uploadProps} multiple={multiple} maxCount={multiple ? 8 : 1} fileList={safeArray(field.value)} onChange={({ fileList }) => field.onChange(fileList)}><p className="ant-upload-drag-icon"><InboxOutlined /></p><p>Перетащите файл сюда или выберите на устройстве</p><span>Покажем имя, размер и предпросмотр изображения.</span></Upload.Dragger></Form.Item>} />; }
