export const getApiErrorMessage = (error, fallbackMessage) => {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  const serverMessage = error?.response?.data?.message;

  if (status === 503 || code === 'DATABASE_UNAVAILABLE' || code === 'PERSISTENT_STORAGE_UNAVAILABLE') {
    return 'Сервис временно недоступен: сейчас есть проблема с базой данных. Попробуйте позже.';
  }

  return serverMessage || fallbackMessage;
};
