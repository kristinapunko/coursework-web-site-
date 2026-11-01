import { useEffect, useState } from "react";
import api from "../api/client";

const LiqPayButton = ({ bookingId, disabled }) => {
    const [payment, setPayment] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (disabled) {
            setPayment(null);
            setError(null);
            return undefined;
        }
        let isMounted = true;

        const loadLiqPay = async () => {
            try {
                const res = await api.get(`/cabinet/api/pay-liqpay/${bookingId}/`);
                if (isMounted) setPayment(res.data);
            } catch (err) {
                console.error("LiqPay init error:", err);
                if (isMounted) setError("Не вдалося завантажити оплату");
            }
        };

        loadLiqPay();

        return () => {
            isMounted = false;
        };
    }, [bookingId, disabled]);

    if (disabled) {
        return (
            <button disabled className="w-full border-2 border-gray-200 text-gray-600 rounded-xl px-4 py-2 cursor-not-allowed">
                Оплата недоступна
            </button>
        );
    }

    if (error) return <p className="text-red-600">{error}</p>;
    if (!payment) return <p>Завантаження кнопки...</p>;

    return (
        <form
            method="POST"
            action="https://www.liqpay.ua/api/3/checkout"
            acceptCharset="utf-8"
            className="flex justify-center border-[#361d32]/60 hover:bg-[#543c52] hover:text-[#f1e8e6] border-2 flex-1 rounded-xl px-4 py-2"
        >
            <input type="hidden" name="data" value={payment.data} />
            <input type="hidden" name="signature" value={payment.signature} />
            <button
                type="submit"
                className=""
            >
                Оплатити
            </button>
        </form>
    );
};

export default LiqPayButton;
