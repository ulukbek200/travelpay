import React from 'react';
import { Button, Card, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const AuthLayout = ({ eyebrow, title, subtitle, children }) => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
  .auth-page {
    position: relative;
    min-height: 100svh;
    overflow-x: hidden;
    overflow-y: auto;
    display: grid;
    place-items: center;
    padding: 88px 18px 32px;
    isolation: isolate;
  }

  .auth-bg-image {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background-image: url("/images/kyrgyzstan-mountains.jpg");
    background-size: cover;
    background-position: center;
  }

  .auth-overlay {
    position: fixed;
    inset: 0;
    background:
      radial-gradient(circle at 16% 16%, rgba(37, 180, 220, 0.30), transparent 26%),
      radial-gradient(circle at 86% 84%, rgba(252, 163, 17, 0.23), transparent 28%),
      linear-gradient(135deg, rgba(5, 19, 38, 0.76), rgba(8, 28, 47, 0.82));
    backdrop-filter: blur(5px);
  }

  .auth-scene-orb {
    position: fixed;
    z-index: 1;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(1px);
  }

  .auth-scene-orb--one {
    width: 220px;
    height: 220px;
    top: 16%;
    left: -92px;
    background: rgba(63, 193, 231, 0.18);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .auth-scene-orb--two {
    width: 170px;
    height: 170px;
    right: -44px;
    bottom: 8%;
    background: rgba(252, 163, 17, 0.16);
    border: 1px solid rgba(255,255,255,0.16);
  }

  .auth-back {
    position: fixed;
    top: 22px;
    left: 22px;
    z-index: 10;
    height: 42px;
    padding: 0 16px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.24);
    background: rgba(255,255,255,0.14);
    color: white;
    backdrop-filter: blur(10px);
    font-weight: 800;
  }

  .auth-center-shell {
    position: relative;
    z-index: 5;
    width: min(100%, 450px);
    margin: 0 auto;
  }

  .auth-card {
    border-radius: 26px !important;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.18) !important;
    background: rgba(255,255,255,0.96) !important;
    backdrop-filter: blur(20px);
    box-shadow: 0 28px 80px rgba(0,0,0,0.32), 0 2px 0 rgba(255,255,255,0.34) inset;
  }

  .auth-card .ant-card-body {
    padding: 32px !important;
  }

  .auth-card-head {
    text-align: center;
    margin-bottom: 24px;
  }

  .auth-logo-tag {
    height: 42px;
    padding: 0 14px 0 10px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #0d4e91, #1677ff 58%, #16b6c4);
    color: white;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .auth-logo-tag img {
    width: 22px;
    height: 22px;
    object-fit: contain;
    filter: drop-shadow(0 6px 10px rgba(11, 19, 32, 0.22));
  }

  .auth-eyebrow {
    display: block;
    margin-bottom: 8px;
    color: #1677ff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .auth-card h2 {
    margin: 0 0 8px !important;
    font-size: 28px !important;
    line-height: 1.16 !important;
    font-weight: 850 !important;
    color: #0f172a !important;
  }

  .auth-card .ant-typography-secondary {
    font-size: 14px;
    line-height: 1.6;
  }

  .auth-form .ant-form-item {
    margin-bottom: 16px;
  }

  .auth-form .ant-input-affix-wrapper,
  .auth-form .ant-input {
    min-height: 48px;
    border-radius: 12px;
    border-color: rgba(15, 75, 125, 0.16);
    transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
  }

  .auth-form .ant-input-affix-wrapper:hover,
  .auth-form .ant-input:hover {
    border-color: rgba(22, 119, 255, 0.58);
  }

  .auth-form-row,
  .auth-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .auth-submit {
    height: 48px;
    border-radius: 12px !important;
    font-weight: 800;
    font-size: 15px;
    background: linear-gradient(135deg, #0758a5, #1677ff 56%, #17b8c6) !important;
    border: none !important;
    box-shadow: 0 14px 28px rgba(10, 92, 174, 0.30);
    transition: transform .2s ease, box-shadow .2s ease !important;
  }

  .auth-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 32px rgba(10, 92, 174, 0.38) !important;
  }

  .auth-divider {
    margin: 22px 0 12px !important;
    color: #6b7280 !important;
    font-size: 12px !important;
  }

  .auth-google-button {
    display: flex;
    justify-content: center;
    min-height: 40px;
    margin-top: 22px;
    padding-top: 20px;
    position: relative;
  }

  .auth-google-button::before {
    content: 'GOOGLE SIGN-IN';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: #6b7280;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-align: center;
  }

  .auth-card .ant-divider {
    display: none;
  }

  .auth-google-note {
    display: block;
    margin-top: 10px;
    color: #7b8798;
    text-align: center;
    font-size: 12px;
    line-height: 1.45;
  }

  .auth-socials {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .auth-socials .ant-btn {
    width: 100%;
    border-radius: 12px !important;
  }

  .auth-socials {
    display: none !important;
  }

  body[data-theme="dark"] .auth-overlay {
    background:
      radial-gradient(circle at 20% 20%, rgba(22,119,255,0.22), transparent 32%),
      radial-gradient(circle at 80% 10%, rgba(252,163,17,0.12), transparent 28%),
      linear-gradient(180deg, rgba(4, 12, 24, 0.74), rgba(4, 12, 24, 0.9));
    backdrop-filter: blur(6px);
  }

  body[data-theme="dark"] .auth-card {
    border: 1px solid rgba(255,255,255,0.14) !important;
    background: rgba(10, 18, 32, 0.82) !important;
    box-shadow: 0 24px 70px rgba(0,0,0,0.42);
  }

  body[data-theme="dark"] .auth-logo-tag {
    background: linear-gradient(135deg, #1677ff, #4096ff);
    color: #fff;
  }

  body[data-theme="dark"] .auth-eyebrow {
    color: #93c5fd;
  }

  body[data-theme="dark"] .auth-card h2,
  body[data-theme="dark"] .auth-card .ant-typography,
  body[data-theme="dark"] .auth-card .ant-form-item-label > label,
  body[data-theme="dark"] .auth-card .ant-checkbox-wrapper,
  body[data-theme="dark"] .auth-card .ant-divider-inner-text,
  body[data-theme="dark"] .auth-card .anticon {
    color: #f8fafc !important;
  }

  body[data-theme="dark"] .auth-card .ant-typography-secondary,
  body[data-theme="dark"] .auth-card .ant-form-item-explain,
  body[data-theme="dark"] .auth-card .ant-divider {
    color: rgba(226, 232, 240, 0.72) !important;
  }

  body[data-theme="dark"] .auth-card .ant-divider::before,
  body[data-theme="dark"] .auth-card .ant-divider::after {
    border-color: rgba(255,255,255,0.12) !important;
  }

  body[data-theme="dark"] .auth-form .ant-input-affix-wrapper,
  body[data-theme="dark"] .auth-form .ant-input,
  body[data-theme="dark"] .auth-form .ant-input-password,
  body[data-theme="dark"] .auth-form .ant-input-outlined,
  body[data-theme="dark"] .auth-socials .ant-btn {
    background: rgba(255,255,255,0.08) !important;
    border-color: rgba(255,255,255,0.14) !important;
    color: #f8fafc !important;
    box-shadow: none !important;
  }

  body[data-theme="dark"] .auth-form .ant-input-affix-wrapper input,
  body[data-theme="dark"] .auth-form .ant-input,
  body[data-theme="dark"] .auth-form input::placeholder {
    color: #f8fafc !important;
  }

  body[data-theme="dark"] .auth-form .ant-input::placeholder,
  body[data-theme="dark"] .auth-form input::placeholder {
    color: rgba(226, 232, 240, 0.48) !important;
  }

  body[data-theme="dark"] .auth-form .ant-input-affix-wrapper .ant-input-prefix,
  body[data-theme="dark"] .auth-form .ant-input-affix-wrapper .ant-input-password-icon,
  body[data-theme="dark"] .auth-form .ant-input-affix-wrapper .anticon {
    color: rgba(191, 219, 254, 0.88) !important;
  }

  body[data-theme="dark"] .auth-card .ant-checkbox .ant-checkbox-inner {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.18);
  }

  body[data-theme="dark"] .auth-card .ant-checkbox-checked .ant-checkbox-inner {
    background: #1677ff;
    border-color: #1677ff;
  }

  body[data-theme="dark"] .auth-card .ant-btn-link,
  body[data-theme="dark"] .auth-inline-link {
    color: #93c5fd !important;
  }

  body[data-theme="dark"] .auth-card .ant-btn-link:hover,
  body[data-theme="dark"] .auth-inline-link:hover {
    color: #bfdbfe !important;
  }

  body[data-theme="dark"] .auth-footer .ant-typography-secondary {
    color: rgba(226, 232, 240, 0.7) !important;
  }

  body[data-theme="dark"] .auth-back {
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(8, 19, 33, 0.72);
    color: #f8fafc;
  }

  @media (max-width: 520px) {
    .auth-page {
      place-items: start center;
      padding: 78px 12px 20px;
    }

    .auth-back {
      top: 14px;
      left: 12px;
      height: 38px;
      padding: 0 12px;
      border-radius: 10px;
    }

    .auth-card {
      border-radius: 18px !important;
    }

    .auth-card .ant-card-body {
      padding: 20px !important;
    }

    .auth-card h2 {
      font-size: 23px !important;
    }

    .auth-card-head {
      margin-bottom: 18px;
    }

    .auth-form-row,
  .auth-footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .auth-form-row .ant-btn,
    .auth-footer .ant-btn {
      padding-left: 0;
    }

    .auth-socials {
      grid-template-columns: 1fr;
    }
  }

  .auth-footer {
    width: 100%;
    justify-content: center;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid rgba(15, 75, 125, 0.10);
  }
`}</style>
      <main className="auth-page">
        <div className="auth-bg-image" aria-hidden="true" />

        <div className="auth-overlay" />
        <div className="auth-scene-orb auth-scene-orb--one" aria-hidden="true" />
        <div className="auth-scene-orb auth-scene-orb--two" aria-hidden="true" />

        <Button
          className="auth-back"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
        >
          TravelPay
        </Button>

        <motion.section
          className="auth-center-shell"
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <Card className="auth-card">
            <div className="auth-card-head">
              <Tag className="auth-logo-tag">
                <img src="/travelpay-logo.svg" alt="TravelPay" />
                <span>TravelPay</span>
              </Tag>
              <Text className="auth-eyebrow">{eyebrow}</Text>
              <Title level={2}>{title}</Title>
              <Text type="secondary">{subtitle}</Text>
            </div>

            {children}
          </Card>
        </motion.section>
      </main>
    </>
  );
};

export default AuthLayout;
