import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Drawer,
  Input,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  CompassOutlined,
  CustomerServiceOutlined,
  HeartOutlined,
  SendOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { readCurrentUser, subscribeToCurrentUser } from '../utils/currentUser';

const { Text } = Typography;

const BRAND_BLUE = '#1d3557';
const BRAND_GOLD = '#fca311';
const CHIP_BG = '#e9f7ff';
const CHIP_TEXT = '#05668d';
const CHIP_BORDER = '#78d6ff';

const suggestedQuestions = [
  'Подбери тур на 3 дня',
  'Как работает оплата тура?',
  'Сравни Иссык-Куль и Колсай',
  'Туры возле Алматы',
  'VIP тур для семьи',
  'Как работает накопление?',
  'Проверить статус платежа',
  'Хочу стать партнёром',
];

const TravelBotWidget = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(() => readCurrentUser()?.favorites?.length || 0);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Здравствуйте. Я TravelPay AI Assistant. Помогу подобрать тур по Кыргызстану или региону Алматы, объясню оплату, накопления, избранное, бронирование и партнёрство.',
    },
  ]);

  useEffect(() => {
    const openAssistant = () => setOpen(true);
    window.addEventListener('open-ai-concierge', openAssistant);
    window.addEventListener('open-travelpay-assistant', openAssistant);

    return () => {
      window.removeEventListener('open-ai-concierge', openAssistant);
      window.removeEventListener('open-travelpay-assistant', openAssistant);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [messages, open]);

  useEffect(() => subscribeToCurrentUser((user) => {
    setFavoritesCount(user?.favorites?.length || 0);
  }), []);

  const sendMessage = async (value = input) => {
    const trimmedMessage = value.trim();
    if (!trimmedMessage || isSending) return;

    setMessages((prev) => [...prev, { sender: 'user', text: trimmedMessage }]);
    setInput('');
    setIsSending(true);

    try {
      const response = await api.post('/api/ai-assistant', {
        message: trimmedMessage,
        profile: JSON.stringify(readCurrentUser() || {}),
        favorites: JSON.stringify(readCurrentUser()?.favorites || []),
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: response.data?.answer || response.data?.reply || 'Уточню детали и помогу вам дальше.',
          provider: response.data?.provider,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Сейчас не удалось подключиться к AI-сервису. Проверьте backend и ключ OPENAI_API_KEY или GEMINI_API_KEY. Я всё равно помогу: напишите направление, даты, бюджет и количество туристов.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const showFavorites = () => {
    const favorites = readCurrentUser()?.favorites || [];
    setFavoritesCount(favorites.length);

    if (!favorites.length) {
      message.info('В избранном пока нет туров');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'В избранном пока нет туров. Откройте страницу туров и добавьте понравившиеся маршруты, затем я помогу их сравнить.',
        },
      ]);
      return;
    }

    const list = favorites
      .slice(0, 5)
      .map((tour) => `- **${tour.title}**: ${tour.location || 'направление уточняется'}, ${tour.price || 'цена по запросу'}`)
      .join('\n');

    setMessages((prev) => [
      ...prev,
      {
        sender: 'assistant',
        text: `Ваши избранные туры:\n\n${list}\n\nМогу сравнить их по цене, сезону, комфорту и длительности.`,
      },
    ]);
  };

  const renderMessage = (item, index) => {
    const isUser = item.sender === 'user';

    return (
      <div key={`${item.sender}-${index}`} style={isUser ? styles.userBubble : styles.assistantBubble}>
        {!isUser && <Avatar size={28} style={styles.messageAvatar} icon={<StarOutlined />} />}
        <div style={isUser ? styles.userMessage : styles.assistantMessage}>
          <ReactMarkdown>{item.text}</ReactMarkdown>
          {item.provider === 'offline' && (
            <Tag color="gold" style={{ marginTop: 8 }}>
              Demo mode
            </Tag>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.button
        type="button"
        className="ai-concierge-button"
        style={styles.floatingButton}
        onClick={() => setOpen(true)}
        whileHover={{ y: -4, boxShadow: '0 18px 42px rgba(252,163,17,0.28)' }}
        whileTap={{ scale: 0.97 }}
      >
        <Badge dot color={BRAND_GOLD}>
          <span style={styles.floatingIcon}>
            <StarOutlined />
            <CompassOutlined />
          </span>
        </Badge>
        <span>TravelPay AI</span>
      </motion.button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width={430}
        placement="right"
        styles={{
          body: styles.drawerBody,
          header: styles.drawerHeader,
          content: styles.drawerContent,
        }}
        title={
          <Space align="center">
            <Avatar style={styles.aiAvatar} icon={<StarOutlined />} />
            <div>
              <Text style={styles.drawerTitle}>TravelPay AI Assistant</Text>
              <br />
              <Text style={styles.drawerSubtitle}>Умный помощник для туров и платежей</Text>
            </div>
          </Space>
        }
      >
        <div style={styles.messages}>
          {messages.map(renderMessage)}
          {isSending && (
            <div style={styles.assistantBubble}>
              <Avatar size={28} style={styles.messageAvatar} icon={<StarOutlined />} />
              <div style={styles.assistantMessage}>
                <Skeleton active paragraph={{ rows: 2 }} title={false} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Готовые вопросы</Text>
          <div style={styles.suggestionGrid}>
            {suggestedQuestions.map((question) => (
              <Button
                key={question}
                size="small"
                className="travelpay-suggestion-chip"
                onClick={() => sendMessage(question)}
                style={styles.suggestionChip}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        <Card size="small" style={styles.utilityCard}>
          <Space wrap>
            <Button size="small" onClick={() => navigate('/tours')}>
              Туры
            </Button>
            <Button size="small" icon={<HeartOutlined />} onClick={showFavorites}>
              Избранное ({favoritesCount})
            </Button>
            <Button size="small" icon={<CustomerServiceOutlined />} onClick={() => sendMessage('Мне нужна консультация менеджера')}>
              Менеджер
            </Button>
          </Space>
        </Card>

        <div style={styles.inputBar}>
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onPressEnter={() => sendMessage()}
            placeholder="Введите вопрос по туру, оплате или бронированию..."
            style={styles.input}
            disabled={isSending}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => sendMessage()}
            loading={isSending}
            style={styles.sendButton}
          />
        </div>
      </Drawer>
    </>
  );
};

const styles = {
  floatingButton: {
    position: 'fixed',
    right: 24,
    bottom: 24,
    zIndex: 1000,
    minHeight: 56,
    borderRadius: 999,
    border: '1px solid rgba(252,163,17,0.55)',
    background: 'linear-gradient(135deg, rgba(10,24,39,0.96), rgba(29,53,87,0.94))',
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 18px',
    cursor: 'pointer',
    fontWeight: 900,
    boxShadow: '0 16px 38px rgba(10,24,39,0.32)',
  },
  floatingIcon: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    color: BRAND_GOLD,
  },
  drawerContent: {
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    overflow: 'hidden',
    background: 'linear-gradient(160deg, #081526 0%, #102a43 52%, #14213d 100%)',
    backdropFilter: 'blur(18px)',
  },
  drawerHeader: {
    background: 'rgba(8,21,38,0.84)',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  },
  drawerBody: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 65px)',
  },
  aiAvatar: {
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd166)`,
    color: BRAND_BLUE,
  },
  drawerTitle: {
    color: '#fff',
    fontWeight: 900,
  },
  drawerSubtitle: {
    color: '#c9d8e8',
    fontSize: 12,
  },
  messages: {
    flex: 1,
    minHeight: 260,
    overflowY: 'auto',
    padding: '18px 18px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  assistantBubble: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  userBubble: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    background: 'rgba(252,163,17,0.18)',
    color: BRAND_GOLD,
    flexShrink: 0,
  },
  assistantMessage: {
    maxWidth: '92%',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.99), rgba(240,247,255,0.96))',
    color: BRAND_BLUE,
    border: '1px solid rgba(252,163,17,0.22)',
    borderRadius: 18,
    padding: '11px 13px',
    lineHeight: 1.55,
    boxShadow: '0 14px 34px rgba(0,0,0,0.16)',
  },
  userMessage: {
    maxWidth: '88%',
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd166)`,
    color: BRAND_BLUE,
    borderRadius: 18,
    padding: '11px 13px',
    lineHeight: 1.55,
    fontWeight: 700,
    boxShadow: '0 12px 28px rgba(252,163,17,0.18)',
  },
  suggestions: {
    flexShrink: 0,
    maxHeight: 138,
    overflowY: 'auto',
    marginTop: 8,
    padding: '10px 16px 12px',
    borderTop: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.04)',
  },
  suggestionsTitle: {
    display: 'block',
    marginBottom: 8,
    color: '#d9ecff',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0,
  },
  suggestionGrid: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  suggestionChip: {
    height: 'auto',
    minHeight: 32,
    borderRadius: 999,
    borderColor: CHIP_BORDER,
    color: CHIP_TEXT,
    background: CHIP_BG,
    fontWeight: 800,
    boxShadow: '0 8px 18px rgba(5,102,141,0.15)',
    whiteSpace: 'normal',
    lineHeight: 1.25,
    padding: '6px 11px',
  },
  utilityCard: {
    margin: '0 16px 10px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.13)',
  },
  inputBar: {
    display: 'flex',
    gap: 10,
    padding: 16,
    background: 'rgba(8,21,38,0.98)',
    borderTop: '1px solid rgba(255,255,255,0.12)',
  },
  input: {
    borderRadius: 14,
    background: 'rgba(255,255,255,0.98)',
  },
  sendButton: {
    borderRadius: 14,
    background: BRAND_GOLD,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 900,
  },
};

export default TravelBotWidget;
