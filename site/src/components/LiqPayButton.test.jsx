import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api/client';
import LiqPayButton, { LIQPAY_UNAVAILABLE_MESSAGE } from './LiqPayButton';

vi.mock('../api/client', () => ({
  default: { get: vi.fn() },
}));

describe('LiqPayButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete window.LiqPayCheckout;
  });

  it('shows a friendly disabled state when LiqPay initialization returns 503', async () => {
    api.get.mockRejectedValue({ response: { status: 503 } });

    render(<LiqPayButton bookingId={101} disabled={false} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(LIQPAY_UNAVAILABLE_MESSAGE);
    expect(screen.getByRole('button', { name: 'Оплата недоступна' })).toBeDisabled();
  });

  it('renders the payment action after successful initialization', async () => {
    const checkout = {
      on: vi.fn(function on() {
        return this;
      }),
    };
    window.LiqPayCheckout = {
      init: vi.fn(() => checkout),
    };
    api.get.mockResolvedValue({
      data: { data: 'encoded-payment-data', signature: 'payment-signature' },
    });
    const user = userEvent.setup();

    render(<LiqPayButton bookingId={101} disabled={false} />);

    const payButton = await screen.findByRole('button', { name: 'Оплатити' });
    expect(payButton).toBeEnabled();
    await user.click(payButton);

    expect(window.LiqPayCheckout.init).toHaveBeenCalledWith({
      data: 'encoded-payment-data',
      signature: 'payment-signature',
      embedTo: '#liqpay-checkout-101',
      language: 'uk',
      mode: 'popup',
    });
    expect(checkout.on).toHaveBeenCalledWith('liqpay.callback', expect.any(Function));
    expect(checkout.on).toHaveBeenCalledWith('liqpay.ready', expect.any(Function));
    expect(checkout.on).toHaveBeenCalledWith('liqpay.close', expect.any(Function));
  });
});

