"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Primer } from "@primer-io/checkout-web"
import { useRouter } from 'next/navigation';

const PaymentContainer = (props: any) => {
    const router = useRouter();
    const [clientToken, setClientToken] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState("")
    const [paymentStatus, setPaymentStatus] = useState("");
    const primerInitialized = useRef(false);

    const {
        package: packageData,
        user,
        shipment,    
    } = props;

    


    const {shouldUpdateSession } = props
    console.log(shouldUpdateSession, 'payment container')  

    // fetch client token
    useEffect(() => {
        const fetchtoken = async () => {
            setError("");
            setLoading(true);
            try {
                const res = await fetch('/api/client-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user,
                        shipment,
                        package: packageData,
                    })
                });

                const data = await res.json();
                if (res.ok && data.token) {
                    setLoading(false);
                    setClientToken(data.token);
                } else {
                    setLoading(false); // ✅ Set loading false on error
                    setError(data.error || 'Failed to fetch token');
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
        }
        fetchtoken();
    }, []);

    //initialize primer 
    useEffect(() => {
        if (clientToken && !primerInitialized.current) {
            console.log('🔄 Token available, initializing Primer...');

            // Small delay to ensure DOM is fully rendered
            const timer = setTimeout(() => {
                initializePrimer(clientToken);
            }, 100);

            // Cleanup timer if component unmounts
            return () => clearTimeout(timer);
        }
    }, [clientToken]);

    // update client session
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


    const initializePrimer = async (token: string) => {
        if (primerInitialized.current) {
            console.log("Primer already initialized");
            return;
        }

        try {
            const container = document.getElementById('primer-checkout-container');


            if (!(container instanceof HTMLElement)) {
                console.error('❌ Invalid container element');
                setError('Payment form container not found or invalid');
                return;
            }

            console.log('🚀 Initializing Primer with token:', token.substring(0, 20) + '...');

            const checkout = await Primer.showUniversalCheckout(token, {
                container: "#primer-checkout-container",

                onCheckoutFail: (error, checkoutPaymentMethod) => {
                    console.error('❌ Primer checkout failed:', error);
                    setError('Payment processing error: ' + error.message);
                    setPaymentStatus('');
                },

                onResumeError: (error) => {
                    console.log('ℹ️ Checkout dismissed by user or resume error:', error);
                    setPaymentStatus('');
                    setError('Payment was cancelled or interrupted');
                },

                // Updated: Handle checkout completion with improved vault token handling
                onCheckoutComplete: (checkoutPaymentMethod: any) => {
                    console.log('✅ Checkout completed:', checkoutPaymentMethod);

                    const vaultToken = checkoutPaymentMethod?.paymentMethod?.paymentMethodToken;
                    const paymentId = checkoutPaymentMethod?.payment?.id;

                    if (vaultToken && checkoutPaymentMethod?.paymentMethod?.isVaulted) {
                        // Store immediately if vault token is available
                        const vaultData = {
                            paymentMethodToken: vaultToken,
                            customerId: checkoutPaymentMethod?.payment?.customerId || 'CUSTOMER-DEFAULT',
                            cardDetails: {
                                last4: checkoutPaymentMethod?.paymentMethod?.last4Digits || 'Unknown',
                                brand: checkoutPaymentMethod?.paymentMethod?.network || 'Unknown',
                                expiryMonth: checkoutPaymentMethod?.paymentMethod?.expirationMonth || '',
                                expiryYear: checkoutPaymentMethod?.paymentMethod?.expirationYear || '',
                                cardholderName: checkoutPaymentMethod?.paymentMethod?.cardholderName || ''
                            },
                            timestamp: Date.now()
                        };
                        localStorage.setItem('vaultData', JSON.stringify(vaultData));
                        console.log('🏦 VAULT TOKEN STORED IMMEDIATELY:', vaultToken);
                    } else if (paymentId) {
                        // Fallback to your existing method
                        fetchPaymentDetails(paymentId);
                    }

                    setPaymentStatus('Checkout completed successfully!');
                    setTimeout(() => {
                        console.log('Payment flow completed - redirecting to upsell');
                        router.push('/upsell');
                    }, 2000);
                },

                onPaymentMethodAction: (paymentMethodAction) => {
                    console.log('🔄 Payment method action required:', paymentMethodAction);
                    setPaymentStatus('Additional verification required...');
                },

                paymentHandling: 'AUTO'
            });


            primerInitialized.current = true;
            console.log('✅ Primer initialized successfully');


        } catch (err) {
            console.error('❌ Primer initialization error:', err);
            setError(`Error while initializing Primer: ${err}`);
        }
    };


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
        <div className='w-full text-center '>
            <div id="primer-checkout-container" className="mb-6 min-h-[200px]">
                {!clientToken ? (
                    <div className="text-center text-gray-500 py-8">
                        Initializing payment form...
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default PaymentContainer