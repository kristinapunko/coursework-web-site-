import { useEffect, useState } from "react";
import api from "../api/client";

const LIQPAY_SDK_URL = "https://static.liqpay.ua/libjs/checkout.js";
let liqPaySdkPromise = null;

const loadLiqPaySdk = () => {
    if (window.LiqPayCheckout) return Promise.resolve(window.LiqPayCheckout);
    if (liqPaySdkPromise) return liqPaySdkPromise;

    liqPaySdkPromise = new Promise((resolve, reject) => {
        const previousCallback = window.LiqPayCheckoutCallback;
        const timeoutId = window.setTimeout(() => {
            liqPaySdkPromise = null;
            reject(new Error("LiqPay SDK loading timed out"));
        }, 15000);

        window.LiqPayCheckoutCallback = () => {
            previousCallback?.();
            window.clearTimeout(timeoutId);
            if (window.LiqPayCheckout) {
                resolve(window.LiqPayCheckout);
            } else {
                liqPaySdkPromise = null;
                reject(new Error("LiqPay SDK did not initialize"));
            }
        };

        document.getElementById("liqpay-checkout-sdk")?.remove();
        const script = document.createElement("script");
        script.id = "liqpay-checkout-sdk";
        script.src = LIQPAY_SDK_URL;
        script.async = true;
        script.onerror = () => {
            window.clearTimeout(timeoutId);
            liqPaySdkPromise = null;
            reject(new Error("LiqPay SDK failed to load"));
        };
        document.head.appendChild(script);
    });

    return liqPaySdkPromise;
};

export const LIQPAY_UNAVAILABLE_MESSAGE =
    "Оплата LiqPay наразі недоступна. Будь ласка, спробуйте пізніше або зв'яжіться з менеджером.";

const LiqPayButton = ({ bookingId, disabled }) => {
    const [payment, setPayment] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

    useEffect(() => {
        if (disabled || !bookingId) {
            setPayment(null);
            setError(null);
            setIsLoading(false);
            return undefined;
        }
        let isMounted = true;

        const loadLiqPay = async () => {
            setPayment(null);
            setError(null);
            setIsLoading(true);
            try {
                const res = await api.get(`/cabinet/api/pay-liqpay/${bookingId}/`);
                if (!res.data?.data || !res.data?.signature) {
                    throw new Error("Invalid LiqPay response");
                }
                if (isMounted) setPayment(res.data);
            } catch {
                if (isMounted) setError(LIQPAY_UNAVAILABLE_MESSAGE);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadLiqPay();

        return () => {
            isMounted = false;
        };
    }, [bookingId, disabled]);

    const openCheckout = async () => {
        if (!payment || isOpening) return;

        setError(null);
        setIsOpening(true);
        try {
            const LiqPayCheckout = await loadLiqPaySdk();
            const checkout = LiqPayCheckout.init({
                data: payment.data,
                signature: payment.signature,
                embedTo: `#liqpay-checkout-${bookingId}`,
                language: "uk",
                mode: "popup",
            });

            checkout
                .on("liqpay.callback", (response) => {
                    const result = {
                        status: response?.status,
                        errorCode: response?.err_code,
                        errorDescription: response?.err_description,
                    };
                    console.info("LiqPay checkout response:", result);
                    if (result.errorCode || result.errorDescription) {
                        setError(result.errorDescription || LIQPAY_UNAVAILABLE_MESSAGE);
                    }
                })
                .on("liqpay.ready", () => setIsOpening(false))
                .on("liqpay.close", () => setIsOpening(false));
        } catch (checkoutError) {
            console.error(
                "LiqPay checkout initialization failed:",
                checkoutError instanceof Error ? checkoutError.message : checkoutError
            );
            setError(LIQPAY_UNAVAILABLE_MESSAGE);
            setIsOpening(false);
        }
    };

    if (disabled || !bookingId) {
        return (
            <button disabled className="w-full border-2 border-gray-200 text-gray-600 rounded-xl px-4 py-2 cursor-not-allowed">
                Оплата недоступна
            </button>
        );
    }

    if (error) {
        return (
            <div role="alert" className="space-y-2 text-center">
                <p className="text-amber-700">{error}</p>
                <button
                    type="button"
                    disabled
                    className="w-full border-2 border-gray-200 text-gray-600 rounded-xl px-4 py-2 cursor-not-allowed"
                >
                    Оплата недоступна
                </button>
            </div>
        );
    }
    if (isLoading || !payment) return <p role="status">Завантаження кнопки...</p>;

    return (
        <div className="flex-1">
            <div id={`liqpay-checkout-${bookingId}`} />
            <button
                type="button"
                onClick={openCheckout}
                disabled={isOpening}
                className="w-full rounded-xl border-2 border-[#361d32]/60 px-4 py-2 hover:bg-[#543c52] hover:text-[#f1e8e6] disabled:cursor-wait disabled:opacity-60"
            >
                {isOpening ? "Відкриття LiqPay..." : "Оплатити"}
            </button>
        </div>
    );
};

export default LiqPayButton;
