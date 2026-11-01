import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../api/client';
import authReducer, { registerUser } from './authSlice';

vi.mock('../../api/client', () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

describe('registration errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('preserves and separates backend field validation messages', async () => {
    api.post.mockRejectedValue({
      response: {
        status: 400,
        data: {
          username: ['Користувач з таким ім\'ям вже існує.'],
          email: ['Введіть коректну адресу електронної пошти.'],
          password1: [
            'Пароль надто відомий.',
            'Цей пароль повністю складається із цифр.',
          ],
        },
      },
    });
    const store = configureStore({ reducer: { auth: authReducer } });

    const action = await store.dispatch(registerUser({
      username: 'existing-user',
      email: 'invalid',
      password1: 'password',
      password2: 'password',
    }));

    expect(action.payload).toBe(
      "Ім’я користувача: Користувач з таким ім'ям вже існує.\n" +
      'Email: Введіть коректну адресу електронної пошти.\n' +
      'Пароль: Пароль надто відомий.\n' +
      'Пароль: Цей пароль повністю складається із цифр.'
    );
    expect(store.getState().auth.error).toBe(action.payload);
  });
});

