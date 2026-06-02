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
  'Сравни Иссык-Куль и Кольсай',
  'Туры возле Алматы',
  'VIP тур для семьи',
  'Как работает накопление?',
  'Если я буду пополнять по 10 000 сом в месяц, когда достигну цели?',
  'Какие туры доступны на мой текущий баланс?',
  'Проверить статус платежа',
  'Хочу стать партнёром',
];

const FALLBACK_REPLY = 'Сейчас ассистент временно недоступен, попробуйте позже.';

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

  const sendMessageToAI = async (messageText, history) => {
    const response = await api.post('/api/ai-chat', {
      message: messageText,
      history,
    });

    return response.data?.reply || FALLBACK_REPLY;
  };

  const sendMessage = async (value = input) => {
    const trimmedMessage = value.trim();
    if (!trimmedMessage || isSending) return;

    const history = messages.map((item) => ({
      role: item.sender === 'user' ? 'user' : 'assistant',
      content: item.text,
    }));

    setMessages((prev) => [...prev, { sender: 'user', text: trimmedMessage }]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await sendMessageToAI(trimmedMessage, history);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: reply || FALLBACK_REPLY,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: FALLBACK_REPLY,
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
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.button
        type="button"
        className="ai-concierge-button travelpay-ai-button"
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
        size={430}
        placement="right"
        styles={{
          body: styles.drawerBody,
          header: styles.drawerHeader,
          section: styles.drawerContent,
        }}
        title={(
          <Space align="center">
            <Avatar style={styles.aiAvatar} icon={<StarOutlined />} />
            <div>
              <Text style={styles.drawerTitle}>TravelPay AI Assistant</Text>
              <br />
              <Text style={styles.drawerSubtitle}>Умный помощник для туров и платежей</Text>
            </div>
          </Space>
        )}
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
    right: 'clamp(12px, 3vw, 32px)',
    bottom: 20,
    zIndex: 1000,
    minHeight: 56,
    border: 'none',
    borderRadius: 999,
    padding: '0 18px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    fontWeight: 800,
    color: '#fff',
    background: 'linear-gradient(135deg, #16324f 0%, #1d3557 55%, #245b86 100%)',
    boxShadow: '0 14px 32px rgba(29,53,87,0.28)',
    cursor: 'pointer',
  },
  floatingIcon: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: BRAND_GOLD,
    background: 'rgba(255,255,255,0.12)',
    fontSize: 16,
  },
  drawerHeader: {
    borderBottom: '1px solid rgba(29,53,87,0.08)',
    background: 'linear-gradient(180deg, #f9fbff 0%, #f3f8ff 100%)',
  },
  drawerContent: {
    background: '#f7fbff',
  },
  drawerBody: {
    padding: 16,
    display: 'grid',
    gridTemplateRows: '1fr auto auto',
    gap: 14,
    background: '#f7fbff',
  },
  drawerTitle: {
    color: BRAND_BLUE,
    fontWeight: 800,
    fontSize: 16,
  },
  drawerSubtitle: {
    color: '#6b7a90',
    fontSize: 12,
  },
  aiAvatar: {
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    color: BRAND_BLUE,
  },
  messages: {
    overflowY: 'auto',
    paddingRight: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  assistantBubble: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  userBubble: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    color: BRAND_BLUE,
    flexShrink: 0,
    marginTop: 4,
  },
  assistantMessage: {
    maxWidth: '88%',
    background: '#ffffff',
    borderRadius: 18,
    padding: '12px 14px',
    color: BRAND_BLUE,
    boxShadow: '0 10px 24px rgba(29,53,87,0.08)',
  },
  userMessage: {
    maxWidth: '88%',
    background: 'linear-gradient(135deg, #1677ff, #245b86)',
    borderRadius: 18,
    padding: '12px 14px',
    color: '#fff',
    boxShadow: '0 10px 24px rgba(22,119,255,0.18)',
  },
  suggestions: {
    display: 'grid',
    gap: 10,
  },
  suggestionsTitle: {
    color: '#6b7a90',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  suggestionGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    borderRadius: 999,
    borderColor: CHIP_BORDER,
    background: CHIP_BG,
    color: CHIP_TEXT,
    fontWeight: 700,
  },
  utilityCard: {
    borderRadius: 18,
    border: '1px solid rgba(29,53,87,0.08)',
    boxShadow: '0 10px 24px rgba(29,53,87,0.06)',
  },
  inputBar: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    border: 'none',
    color: BRAND_BLUE,
    boxShadow: '0 12px 24px rgba(252,163,17,0.22)',
  },
};

export default TravelBotWidget;
