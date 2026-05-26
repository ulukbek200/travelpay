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
    overflow: hidden;
  }

  .auth-bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .auth-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      rgba(7, 17, 35, 0.65),
      rgba(7, 17, 35, 0.75)
    );
    backdrop-filter: blur(3px);
  }

  .auth-back {
    position: absolute;
    top: 28px;
    left: 28px;
    z-index: 10;
    height: 42px;
    padding: 0 16px;
    border-radius: 14px;
    border: none;
    background: rgba(255,255,255,0.15);
    color: white;
    backdrop-filter: blur(10px);
  }

  .auth-center-shell {
    position: relative;
    z-index: 5;

    width: 100%;
    max-width: 410px;

    /* ИДЕАЛЬНО ПО ЦЕНТРУ */
    margin: 0 auto;

    padding: 16px;
  }

  .auth-card {
    border-radius: 28px !important;
    overflow: hidden;

    border: 1px solid rgba(255,255,255,0.15);

    background: rgba(255,255,255,0.92) !important;

    backdrop-filter: blur(20px);

    box-shadow:
      0 20px 60px rgba(0,0,0,0.22),
      0 0 0 1px rgba(255,255,255,0.08);
  }

  .auth-card .ant-card-body {
    padding: 30px !important;
  }

  .auth-card-head {
    text-align: center;
    margin-bottom: 24px;
  }

  .auth-logo-tag {
    height: 32px;
    padding: 0 14px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #1677ff, #00b4d8);
    color: white;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    margin-bottom: 14px;
  }

  .auth-eyebrow {
    display: block;
    margin-bottom: 8px;
    color: #1677ff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .auth-card h2 {
    margin-bottom: 8px !important;
    font-size: 28px !important;
    font-weight: 800 !important;
    color: #0f172a !important;
  }

  .auth-card .ant-typography-secondary {
    font-size: 14px;
    line-height: 1.6;
  }

  .auth-form .ant-input-affix-wrapper {
    height: 48px;
    border-radius: 12px;
  }

  .auth-form .ant-btn-primary {
    height: 48px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;

    background: linear-gradient(135deg, #1677ff, #00b4d8);
    border: none;

    box-shadow: 0 12px 24px rgba(22,119,255,0.3);
  }

  .auth-form .ant-btn-primary:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .auth-center-shell {
      max-width: 100%;
      padding: 18px;
    }

    .auth-card .ant-card-body {
      padding: 24px !important;
    }

    .auth-card h2 {
      font-size: 24px !important;
    }
  }
`}</style>
      <main className="auth-page tw-min-h-screen tw-grid tw-place-items-center">
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
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <Card className="auth-card tw-rounded-2xl tw-shadow-xl">
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