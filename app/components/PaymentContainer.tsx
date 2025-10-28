"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Primer, PrimerCheckout } from "@primer-io/checkout-web"
import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';

const PaymentContainer = (props: any) => {
    const router = useRouter();
    const [clientToken, setClientToken] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState("")
    const [paymentStatus, setPaymentStatus] = useState("");
    const [iframeUrl, setIframeUrl] = useState<string | null>(null); // 🧩 Added for iframe display
    const primerInitialized = useRef(false);
    const checkoutRef = useRef<PrimerCheckout | null>(null);

    const {
        package: packageData,
        user,
        shipment,
    } = props;

    const { shouldUpdateSession } = props
    console.log(shouldUpdateSession, 'payment container')


    const handleCustomButtonClick = async () => {
        console.log('clicked custom button');
        setLoading(true);

        // 🧾 Order + Merchant details
        const order_number = "order-1234";
        const order_amount = packageData.price;
        const order_currency = "USD";
        const order_description = "Important gift";
        const merchant_pass = "9e7d01b8a2ce585c1108432aa102b489";

        const to_md5 = (order_number + order_amount + order_currency + order_description + merchant_pass).toUpperCase();
        const md5Hash = CryptoJS.MD5(to_md5).toString();
        const sha1Hash = CryptoJS.SHA1(md5Hash).toString(CryptoJS.enc.Hex);

        console.log('Generated session hash:', sha1Hash);

        // 📦 Build payload (updated)
        const payload = {
            merchant_key: "eb515e92-a819-11f0-95c8-ae0005bd273e",
            operation: "purchase",
            methods: ["card"],
            order: {
                number: order_number,
                amount: order_amount,
                currency: order_currency,
                description: order_description
            },
            cancel_url: "https://hopepharma-jointivilpro-production.up.railway.app/",
            success_url: "https://hopepharma-jointivilpro-production.up.railway.app/upsell",
            customer: {
                name: "Moussa Nasreddine",
                email: "moussanasreddine@gmail.com"
            },
            billing_address: {
                country: "US",
                state: "CA",
                city: "Los Angeles",
                address: "Moor Building 35274",
                zip: "123456",
                phone: "347771112233"
            },
            recurring_init: "true",
            req_token: "true",
            hash: sha1Hash
        };

        try {
            const response = await fetch('/api/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Session created successfully:', data);

            // ✅ Instead of redirecting, show the payment URL in an iframe
            if (data.redirect_url) {
                setIframeUrl(data.redirect_url);
            } else {
                console.error("No redirect_url found in API response.");
            }

        } catch (error) {
            console.error('❌ Error creating session:', error);
        } finally {
            setLoading(false);
        }
    };


    // 🧠 Session update logic (unchanged)
    useEffect(() => {
        if (!shouldUpdateSession || !clientToken) {
            console.log("⏸️ Skipping session update - forms not valid or no token");
            return;
        }
        if (!clientToken) return;
        const timeout = setTimeout(() => {
            const updateClientSession = async () => {
                try {
                    const res = await fetch('/api/update-client-session', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(
                            {
                                user,
                                shipment,
                                package: packageData,
                                clientToken
                            }
                        ),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        console.error("❌ Failed to update client session:", data.error);
                    } else {
                        console.log("✅ Client session updated:", data.clientSession);
                    }

                } catch (error) {
                    if (error instanceof Error) {
                        setError(`Error fetching token: ${error.message}`);
                    } else if (typeof error === 'string') {
                        setError(`Error fetching token: ${error}`);
                    } else {
                        setError(`Error fetching token: An unknown error occurred`);
                    }
                    setLoading(false);
                }
            };
            console.log("🔄 Updating client session with latest data...");
            updateClientSession();
            localStorage.setItem('latestPackage', JSON.stringify(packageData));
        }, 200);

        return () => clearTimeout(timeout);
    }, [shouldUpdateSession]);


    // 🔧 Helper: Fetch payment details (unchanged)
    const fetchPaymentDetails = async (paymentId: string) => {
        try {
            const response = await fetch(`/api/vault-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ paymentId })
            });
            const payment = await response.json();

            if (payment.paymentMethod?.isVaulted) {
                const vaultData = {
                    paymentMethodToken: payment.paymentMethod.paymentMethodToken,
                    customerId: payment.customerId,
                    cardDetails: {
                        last4: payment.paymentMethod.paymentMethodData.last4Digits,
                        brand: payment.paymentMethod.paymentMethodData.network,
                        expiryMonth: payment.paymentMethod.paymentMethodData.expirationMonth,
                        expiryYear: payment.paymentMethod.paymentMethodData.expirationYear,
                        cardholderName: payment.paymentMethod.paymentMethodData.cardholderName
                    },
                    timestamp: Date.now()
                };

                localStorage.setItem('vaultData', JSON.stringify(vaultData));
                console.log('🏦 COMPLETE VAULT DATA STORED (FALLBACK):', vaultData);
            }
        } catch (error) {
            console.error('Error fetching payment details:', error);
        }
    };


    if (isLoading) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (error && !clientToken) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center text-red-600">
                    <p>Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full text-center'>
            {/* Payment button (unchanged) */}
            {!iframeUrl && (
                <button
                    onClick={handleCustomButtonClick}
                    className="bg-[#ffd712] h-[100px] w-full min-w-[340px] flex flex-col items-center justify-center gap-2 rounded-lg shadow-lg text-center hover:bg-[#ffdb28] transition-colors"
                >
                    <p className="font-bold">COMPLETE PURCHASE</p>
                    <p>TRY IT RISK FREE! - 90 DAY MONEY BACK GUARANTEE!</p>
                </button>
            )}

            {/* 🧩 Payment iframe (only shows when redirect_url exists) */}
            {iframeUrl && (
                <div className="mt-6">
                    <iframe
                        src={iframeUrl}
                        width="100%"
                        height="750"
                        className="border rounded-lg shadow-md"
                        allow="payment *; fullscreen"
                    />
                </div>
            )}
        </div>
    );
}

export default PaymentContainer;
