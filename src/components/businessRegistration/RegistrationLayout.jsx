import React from 'react';
import { Button, Steps } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const items = ['Аккаунт', 'Личные данные', 'Компания', 'Контакты', 'Реквизиты', 'Документы', 'Проверка'].map((title) => ({ title }));

export default function RegistrationLayout({ step, children, onBack, onNext, onCancel, onDraft, nextLabel = 'Продолжить', nextDisabled, loading, isFinal }) {
  return (
    <main className="business-register-page">
      <header className="business-register-page__header">
        <a href="/business" className="business-register-page__brand" aria-label="TravelPay Business">TravelPay <span>Business</span></a>
        <Button type="text" onClick={onDraft} aria-label="Сохранить черновик регистрации">Сохранить черновик</Button>
      </header>
      <section className="business-register-shell">
        <div className="business-register-intro"><span>Партнёрская регистрация</span><h1>Создайте профиль компании</h1><p>Заполняйте данные по шагам. Черновик сохраняется автоматически в этом браузере.</p></div>
        <div className="business-register-steps" aria-label="Этапы регистрации"><Steps current={step} items={items} responsive={false} /></div>
        <AnimatePresence mode="wait">
          <motion.div key={step} className="business-register-stage" initial={{ opacity: 0, x: 24, scale: .985 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -20, scale: .985 }} transition={{ duration: .22 }}>
            {children}
          </motion.div>
        </AnimatePresence>
        <footer className="business-register-actions">
          <div>{step > 0 && <Button size="large" onClick={onBack} disabled={loading}>Назад</Button>}{step === 0 && <Button size="large" onClick={onCancel} disabled={loading}>Отмена</Button>}</div>
          <Button type="primary" size="large" onClick={onNext} disabled={nextDisabled} loading={loading}>{isFinal ? 'Завершить регистрацию' : nextLabel}</Button>
        </footer>
      </section>
    </main>
  );
}
