export const requiredRule = (message) => ({
  required: true,
  message,
});

export const emailRules = [
  requiredRule('Введите email'),
  { type: 'email', message: 'Введите корректный email' },
];

export const loginPasswordRules = [
  requiredRule('Введите пароль'),
];

export const passwordRules = [
  requiredRule('Введите пароль'),
  { min: 6, message: 'Пароль должен быть минимум 6 символов' },
];

export const phoneRules = [
  requiredRule('Введите телефон'),
  {
    pattern: /^[+\d\s()-]{7,}$/,
    message: 'Введите корректный телефон',
  },
];

export const confirmPasswordRules = [
  requiredRule('Повторите пароль'),
  ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Пароли не совпадают'));
    },
  }),
];

export const agreementRules = [
  {
    validator: (_, value) => (
      value ? Promise.resolve() : Promise.reject(new Error('Подтвердите согласие с условиями'))
    ),
  },
];
