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
  }

  .auth-bg-image {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .auth-overlay {
    position: fixed;
    inset: 0;
    background: linear-gradient(180deg, rgba(7, 17, 35, 0.68), rgba(7, 17, 35, 0.84));
    backdrop-filter: blur(3px);
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
    width: min(100%, 430px);
    margin: 0 auto;
  }

  .auth-card {
    border-radius: 22px !important;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.18) !important;
    background: rgba(255,255,255,0.94) !important;
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.24);
  }

  .auth-card .ant-card-body {
    padding: 28px !important;
  }

  .auth-card-head {
    text-align: center;
    margin-bottom: 22px;
  }

  .auth-logo-tag {
    height: 32px;
    padding: 0 14px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #1677ff, #00b4d8);
    color: white;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    margin-bottom: 14px;
  }

  .auth-eyebrow {
    display: block;
    margin-bottom: 8px;
    color: #1677ff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0;
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
    background: linear-gradient(135deg, #1677ff, #00b4d8) !important;
    border: none !important;
    box-shadow: 0 12px 24px rgba(22,119,255,0.28);
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
`}</style>
      <main className="auth-page">
        <video autoPlay muted loop playsInline className="auth-bg-image">
          <source
            src="https://videos.pexels.com/video-files/854976/854976-hd_1920_1080_30fps.mp4"
            type="video/mp4"
          />
          <source
            src="https://cdn.pixabay.com/video/2021/08/10/84776-587945089_large.mp4"
            type="video/mp4"
          />
        </video>

        <div className="auth-overlay" />

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
              <Tag className="auth-logo-tag">TravelPay</Tag>
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
