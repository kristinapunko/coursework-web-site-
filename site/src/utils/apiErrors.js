const FIELD_LABELS = {
  username: "Ім’я користувача",
  email: "Email",
  password: "Пароль",
  password1: "Пароль",
  password2: "Підтвердження пароля",
};

const collectMessages = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(collectMessages);
  if (typeof value === 'object') {
    return Object.values(value).flatMap(collectMessages);
  }
  return [String(value)];
};

const messagesFromResponse = (data) => {
  if (data == null) return [];
  if (typeof data !== 'object' || Array.isArray(data)) return collectMessages(data);

  return Object.entries(data).flatMap(([field, value]) => {
    const messages = collectMessages(value);
    const label = FIELD_LABELS[field];
    return label ? messages.map((message) => `${label}: ${message}`) : messages;
  });
};

export const getApiErrorMessage = (error, fallback) => {
  const messages = messagesFromResponse(error?.response?.data);
  if (messages.length) return messages.join('\n');
  return error?.message || fallback;
};

