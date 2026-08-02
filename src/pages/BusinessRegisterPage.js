import React, { useEffect, useMemo, useState } from 'react';
import { Button, Result, message } from 'antd';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { getApiErrorMessage } from '../utils/apiErrors';
import { BUSINESS_MONTHLY_PLAN_ID, findCottagePlan, isSelfServiceCottagePlan } from '../config/businessPricing';
import RegistrationLayout from '../components/businessRegistration/RegistrationLayout';
import { StepAccount, StepPersonal, StepCompany, StepContacts, StepPayments, StepDocuments, StepReview } from '../components/businessRegistration/RegistrationSteps';

const DRAFT_KEY = 'travelpay-business-registration-draft-v2';
const MAX_TOTAL_UPLOAD_SIZE = 40 * 1024 * 1024;
const stepFields = [
  ['email', 'password', 'confirmPassword'], ['firstName', 'lastName', 'countryCode', 'phone'],
  ['logo', 'companyName', 'category', 'description', 'address', 'region', 'companyEmail'],
  ['whatsapp', 'managerPhone', 'instagramUrl', 'workingHours'], ['paymentMethods'], ['passport', 'receipt'], ['agreement'],
];

const defaults = {
  countryCode: '+996',
  paymentMethods: [{ type: 'QR', recipient: '', account: '' }],
  documents: [],
  selectedPlanId: BUSINESS_MONTHLY_PLAN_ID,
};
const fileDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
const fileSize = (dataUrl) => Math.ceil(((dataUrl || '').split(',')[1] || '').length * 3 / 4);
const serializeDraft = (data) => Object.fromEntries(Object.entries(data).filter(([, value]) => !Array.isArray(value) || !value.some((item) => item?.originFileObj)));
const normalizeSelectedPlanId = (value) => (isSelfServiceCottagePlan(value) ? value : BUSINESS_MONTHLY_PLAN_ID);
const readDraft = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    return { ...defaults, ...saved, selectedPlanId: normalizeSelectedPlanId(saved.selectedPlanId) };
  } catch {
    return defaults;
  }
};

export default function BusinessRegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(() => Number(localStorage.getItem(`${DRAFT_KEY}:step`)) || 0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const requestedPlanId = searchParams.get('plan');
  const requestedPlan = findCottagePlan(requestedPlanId);
  const initialValues = useMemo(() => {
    const draft = readDraft();
    // The current server only supports Business monthly. Do not let an
    // unsupported URL parameter misrepresent the subscription on the review.
    if (isSelfServiceCottagePlan(requestedPlan)) {
      return { ...draft, selectedPlanId: requestedPlan.id };
    }
    return { ...draft, selectedPlanId: normalizeSelectedPlanId(draft.selectedPlanId) };
  }, [requestedPlan]);
  const methods = useForm({ mode: 'onChange', defaultValues: initialValues });
  const { trigger, getValues, watch, reset, setValue } = methods;
  const values = watch();

  useEffect(() => {
    if (isSelfServiceCottagePlan(requestedPlan) && getValues('selectedPlanId') !== requestedPlan.id) {
      setValue('selectedPlanId', requestedPlan.id, { shouldDirty: false, shouldValidate: false });
    }
  }, [getValues, requestedPlan, setValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(serializeDraft(values)));
      localStorage.setItem(`${DRAFT_KEY}:step`, String(step));
    }, 250);
    return () => clearTimeout(timer);
  }, [values, step]);

  const nextDisabled = (() => {
    const value = getValues();
    if (step === 0) return !value.email || !value.password || value.password !== value.confirmPassword || !/(?=.*[a-zA-Z])(?=.*\d).{8,}/.test(value.password || '');
    if (step === 1) return !value.firstName || !value.lastName || !value.phone;
    if (step === 2) return !value.companyName || !value.category || !value.description || !value.address || !value.region || !value.companyEmail;
    if (step === 3) return !value.whatsapp || !value.managerPhone || !value.instagramUrl || !value.workingHours;
    if (step === 4) return !value.paymentMethods?.length || value.paymentMethods.some((item) => !item.type || !item.recipient || !item.account);
    if (step === 5) return !value.passport?.length || !value.receipt?.length;
    return !value.agreement;
  })();

  const saveDraft = () => { localStorage.setItem(DRAFT_KEY, JSON.stringify(serializeDraft(getValues()))); localStorage.setItem(`${DRAFT_KEY}:step`, String(step)); message.success('Черновик сохранён в этом браузере.'); };
  const next = async () => { const valid = await trigger(stepFields[step]); if (!valid) return; if (step < 6) setStep((value) => value + 1); else submit(); };

  const submit = async () => {
    if (loading || !(await trigger())) return;
    setLoading(true);
    try {
      const v = getValues();
      const convert = async (entry) => {
        const file = entry?.originFileObj; if (!file) return null;
        const dataUrl = await fileDataUrl(file); return { name: file.name, type: file.type, size: fileSize(dataUrl), dataUrl };
      };
      const [profilePhoto, logo, passport, receipt, ...documents] = await Promise.all([v.profilePhoto?.[0], v.logo?.[0], v.passport?.[0], v.receipt?.[0], ...(v.documents || [])].map(convert));
      const total = [profilePhoto, logo, passport, receipt, ...documents].filter(Boolean).reduce((sum, file) => sum + file.size, 0);
      if (total > MAX_TOTAL_UPLOAD_SIZE) throw new Error('Размер файлов превышает 40 МБ. Уменьшите изображения или загрузите меньше документов.');
      await api.post('/business/register', {
        companyName: v.companyName, companyEmail: v.companyEmail, ownerName: `${v.firstName} ${v.lastName}`.trim(), firstName: v.firstName, lastName: v.lastName,
        phone: `${v.countryCode} ${v.phone}`.trim(), email: v.email, password: v.password, city: v.region, region: v.region,
        address: v.address, instagramUrl: v.instagramUrl, facebookUrl: v.facebookUrl, website: v.website, category: v.category,
        whatsapp: v.whatsapp, telegram: v.telegram, personalTelegram: v.personalTelegram, managerPhone: v.managerPhone, workingHours: v.workingHours,
        description: v.description, logo: logo?.dataUrl || '', profilePhoto: profilePhoto?.dataUrl || '', documents: documents.filter(Boolean), passportImage: passport?.dataUrl || '', passportName: passport?.name || '', passportType: passport?.type || '', receiptImage: receipt?.dataUrl || '', receiptName: receipt?.name || '', receiptType: receipt?.type || '', paymentMethods: v.paymentMethods,
        // Kept as optional metadata: the current API remains authoritative for
        // the actual subscription and safely ignores unknown additional fields.
        selectedPlanId: v.selectedPlanId || BUSINESS_MONTHLY_PLAN_ID,
        agreementAccepted: true, contractAccepted: true,
      });
      localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(`${DRAFT_KEY}:step`); reset(defaults); setSubmitted(true);
    } catch (error) { message.error(error?.message || getApiErrorMessage(error, 'Не удалось отправить заявку. Проверьте данные и попробуйте снова.')); } finally { setLoading(false); }
  };

  if (submitted) return <main className="business-register-success"><Result status="success" title="Компания успешно зарегистрирована!" subTitle="Заявка отправлена на проверку. После подтверждения откроется кабинет компании." extra={[<Button key="cabinet" type="primary" size="large" onClick={() => navigate('/business/login')}>Перейти в кабинет</Button>, <Button key="home" size="large" onClick={() => navigate('/business')}>К TravelPay Business</Button>]}><div className="business-register-success__next">✓ Добавить первый тур<br />✓ Добавить домики<br />✓ Настроить способы оплаты<br />✓ Пригласить сотрудников</div></Result></main>;
  const CurrentStep = [StepAccount, StepPersonal, StepCompany, StepContacts, StepPayments, StepDocuments, StepReview][step];
  return <FormProvider {...methods}><RegistrationLayout step={step} onBack={() => setStep((value) => Math.max(0, value - 1))} onNext={next} onCancel={() => navigate('/business')} onDraft={saveDraft} nextDisabled={nextDisabled} loading={loading} isFinal={step === 6}><CurrentStep /></RegistrationLayout></FormProvider>;
}
