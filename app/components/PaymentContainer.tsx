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
    const primerInitialized = useRef(false);
    const checkoutRef = useRef<PrimerCheckout | null>(null);
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);

    const {
        package: packageData,
        user,
        shipment,
    } = props;

    const { shouldUpdateSession } = props



    const handleCustomButtonClick = async () => {

        console.log('clicked custom button');

        if (shouldUpdateSession === false) {
            document.getElementById('errorSection')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        setLoading(true);

        const order_number = `ORDER-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const rawAmount = packageData.price * packageData.quantity + (packageData.expeditedShipping ? 10.0 : 0.0);

        const order_amount = Number(rawAmount.toFixed(2));
        console.log("quantity", packageData.quantity);
        console.log("price", packageData.price);
        console.log('Order Amount:', order_amount);
        const order_currency = "USD";
        const order_description = "Jointivil Purchase";
        const merchant_pass = process.env.NEXT_PUBLIC_MERCHANT_PASS;

        const to_md5 = (order_number + order_amount + order_currency + order_description + merchant_pass).toUpperCase();
        const md5Hash = CryptoJS.MD5(to_md5).toString();
        const sha1Hash = CryptoJS.SHA1(md5Hash).toString(CryptoJS.enc.Hex);

        console.log('Generated session hash:', sha1Hash);

        // 📦 Build payload (updated)
        const payload = {
            merchant_key: process.env.NEXT_PUBLIC_MERCHANT_KEY,
            operation: "purchase",
            methods: ["card"],
            order: {
                number: order_number,
                amount: order_amount,
                currency: order_currency,
                description: order_description
            },
            cancel_url: process.env.NEXT_PUBLIC_BASE_URL,
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}thank-you`,
            customer: {
                name: user.name + " " + user.surname,
            },
            billing_address: {
                country: shipment.country || "",
                state: shipment.state || "",
                city: shipment.city || "",
                address: shipment.address || "",
                zip: shipment.postcode || "",
                phone: user.phone || "",
            },
            recurring_init: "true",
            req_token: "true",
            url_target: "_parent",
            form_id: "3901e7aa-c706-11f0-b8ef-f60c18a2f660",
            hash: sha1Hash
        };


        console.log('🔹 Payload for session creation:', payload);
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

            if (data.redirect_url) {
                setIframeUrl(data.redirect_url);
            } else {
                console.error("No redirect_url found in API response.");
            }

            // const element = document.getElementById("payer_name");

            // setTimeout(() => {
            //     console.log(element, "***************************")
            //     if (element) {
            //         element.value = `${user.name} ${user.surname}`;
            //     }
            // }, 2000);
            localStorage.setItem('latestPackage', JSON.stringify(packageData));
            // if (data.redirect_url) {
            //     window.location.href = data.redirect_url;
            // } else {
            //     console.error("No redirect_url found in API response.");
            // }

        } catch (error) {
            console.error('❌ Error creating session:', error);
        } finally {
            setLoading(false);
        }
    };


    // 🧠 Session update logic (unchanged)
    useEffect(() => {
        console.log(shouldUpdateSession , "******************")
        if (!shouldUpdateSession) {
            console.log("⏸️ Skipping session update - forms not valid or no token");
            return;
        }
       
        handleCustomButtonClick();
    }, [shouldUpdateSession]);

    //     useEffect(() => {
    //         const element = document.getElementById("payer_name");
    //         console.log(element, "***************************")
    //         if (element) {
    //             element.value = `${user.name} ${user.surname}`;
    //         }

    //  }, [iframeUrl])
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

                        // onLoad={(e) => {
                        //     setTimeout(() => {
                        //         const iframe = e.target;
                        //         try {
                        //             const element = iframe.contentDocument.getElementById("payer_name");
                        //             if (element) {
                        //                 element.value = `${user.name} ${user.surname}`;
                        //             }
                        //         } catch (error) {
                        //             console.error("Error accessing iframe content:", error);
                        //         }
                        //     }, 2000); 
                        // }}

                    />
                </div>
            )}
        </div>
    );
}

export default PaymentContainer;
