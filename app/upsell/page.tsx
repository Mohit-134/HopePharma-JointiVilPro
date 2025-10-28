"use client"
import React, { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import { useRouter } from 'next/navigation';
import { upsellBundle } from '../constants/bundle';
interface VaultData {
    paymentMethodToken: string;
    customerId: string;
    cardDetails: {
        last4: string;
        brand: string;
        expiryMonth: string;
        expiryYear: string;
        cardholderName: string;
    };
    timestamp: number;
}

const UpsellPage = () => {
    const router = useRouter();
    const [vaultData, setVaultData] = useState<VaultData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
     const {label,price,quantity,popular} = upsellBundle;
    
    useEffect(() => {
        const storedVaultData = localStorage.getItem('vaultData');
        if (storedVaultData) {
            try {
                const parsed = JSON.parse(storedVaultData);
                setVaultData(parsed);
                console.log('🏦 Vault data loaded for upsell:', parsed);
            } catch (err) {
                console.error('Error parsing vault data:', err);
                setError('Payment method not available');
            }
        } else {
            console.log('⚠️ No vault data found, user may have refreshed or direct navigation');
        }
    }, []);

    // const processOneClickPayment = async () => {
    //     if (!vaultData?.paymentMethodToken) {
    //         setError('No payment method available');
    //         return;
    //     }

    //     setIsProcessing(true);
    //     setError('');

    //     try {
    //         const response = await fetch('/api/one-click-payment', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 paymentMethodToken: vaultData.paymentMethodToken,
    //                 amount: price * quantity,
    //                 currency: 'USD',
    //                 orderId: `upsell_${Date.now()}`,
    //                 customerId: vaultData.customerId,
    //                 description: `Upsell: ${label}`,
    //             }),
    //         });

    //         const result = await response.json();

    //         if (response.ok && result.success) {
    //             setSuccess('🎉 Upsell payment successful!');
    //             console.log('✅ One-click payment completed:', result);

    //             // Optional: Clear vault data after successful upsell
    //             localStorage.removeItem('vaultData');
    //             localStorage.setItem('upsellPackage', JSON.stringify(upsellBundle));

    //             setTimeout(() => {
    //                 router.push('/thank-you');
    //             }, 500);
    //         } else {
    //             setError(`Payment failed: ${result.error || 'Unknown error'}`);
    //             console.error('❌ One-click payment failed:', result);
    //         }
    //     } catch (err) {
    //         console.error('❌ One-click payment error:', err);
    //         setError('Payment processing failed');
    //     } finally {
    //         setIsProcessing(false);
    //     }
    // };

    const handleCustomButtonClick = async () => {
        console.log('clicked custom button');
    
        // 🧾 Order + Merchant details
        const order_number = "order-1234";
        const order_amount = "39.99";
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
            success_url: "https://hopepharma-jointivilpro-production.up.railway.app/thank-you",
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
            card_token: "true",
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
    
            // Optional redirect if API returns redirect_url
            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            }
    
        } catch (error) {
            console.error('❌ Error creating session:', error);
        }
    };
    const skipUpsell = () => {
        // Optional: Clear vault data when skipping
        localStorage.removeItem('vaultData');
        router.push('/thank-you');
    };

    // // If no vault data, show simplified version
    // if (!vaultData) {
    //     return (
    //         <div className="min-h-screen  flex items-center justify-center p-4">
    //             <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
    //                 <h2 className="text-2xl font-bold mb-4">🎯 Special Offer!</h2>
    //                 <p className="text-gray-600 mb-4">{label}</p>
                   

    //                 {error && (
    //                     <div className="border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    //                         {error}
    //                     </div>
    //                 )}

    //                 <button
    //                     onClick={skipUpsell}
    //                     className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
    //                 >
    //                     Continue to Thank You Page
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen  ">
            <div className=" w-[100%] mx-auto flex-col items-center justify-center ">

                {/* Header */}
                <div className="items-center flex flex-col gap-5 p-4  justify-center text-center">
                    <p className='text-red-700 font-semibold'>This Offer Expires When Sold Out!</p>
                    <p className='text-4xl font-extrabold '>Wait, your order is not complete...</p>
                    <p className='text-2xl text-center'>Smart buyers double down on results — grab <strong>2 additional bottles</strong> now at a massive discount before this closes.</p>
                </div>

                <div className="p-6 mx-4 bored border-dashed border-2 grid grid-cols-6  w-[100%] lg:w-[60%] max-h-[450px] sm:max-h-full overflow-hidden lg:mx-auto ">

                    { /* {left container} */}
                    <div className="col-span-2 flex flex-col items-center justify-around lg:items-start  " >

                        <div className='  '>
                            <img
                                src="./images/natural-badge.webp"
                                alt="Natural Badge"
                                className=" w-24 mb-4"
                            />

                        </div>
                        {/* Product Image (always visible, responsive) */}
                        <div className=''>
                            <img
                                src="./images/product4.webp"
                                alt="Product"
                                className='object-cover sm:object-fit lg:h-[100%] h-[200px] mx-auto '
                            // className="h-[100%] object-fit  sm:max-h-[400px] md:max-h-[500px]"
                            />
                        </div>

                   

                    </div>

                    { /* {right container} */}
                    <div className="col-span-4">

                        {/* Top Title */}
                        <p className="text-xl sm:text-2xl md:text-[28px] lg:text-[31px] text-[#303030] tracking-tight font-semibold">
                            <strong style={{ fontFamily: 'Fjalla One, sans-serif' }}>
                                OUR #1 BEST SELLING
                            </strong>
                        </p>

                        {/* Main Headline */}
                        <div
                            className="text-[#ea1190] text-4xl sm:text-5xl md:text-6xl lg:text-[63px] leading-[1] font-extrabold transform -rotate-5 italic relative"
                            style={{ fontFamily: 'Fjalla One, sans-serif' }}
                        >
                            <p>MALE POTENCY</p>
                            <p className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px]">BOOSTER!</p>
                        </div>

                        {/* Subtitle */}
                        <p
                            className="text-xl sm:text-2xl md:text-[26px] lg:text-[30px] tracking-tight my-4 font-semibold"
                            style={{ fontFamily: 'Oswald, sans-serif' }}
                        >
                            THE MOST POWERFUL POTENCY CAPSULES!
                        </p>

                        {/* Bullet Points */}
                        <ul className="my-4 space-y-1 text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <li>⚡ Supports <strong> male vitality</strong></li>
                            <li>💪 Boosts <strong> Performance & Endurance</strong></li>
                            <li>🍃 Powered by <strong>Natural Extracts</strong></li>
                        </ul>

                        {/* Call to Action Text */}
                        <p
                            className="text-base sm:text-lg md:text-xl lg:text-2xl"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Claim Your Order Today Only
                        </p>

                        {/* Price */}
                        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] tracking-tight font-extrabold">
                            $39.94 / per bottle
                        </p>
                    </div>


                </div>

                <p style={{ fontFamily: 'Oswald, sans-serif' }} className='text-[48px] text-[#CB1313] my-5   mx-auto w-fit' >ONLY 17 LEFT!</p>


                {/* Action Buttons */}
                <div className="space-y-3 flex flex-col items-center ">
                    <button
                        // onClick={processOneClickPayment}
                        onClick={handleCustomButtonClick}
                        disabled={isProcessing}
                        className={`text-white w-[60%] mx-auto max-w-[775px} h-[70px] font-semibold px-4 py-2 rounded flex items-center justify-center border cursor-pointer transition-opacity duration-200 ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                        style={{
                            background: 'linear-gradient(to bottom, #94DE57, #4E9510)',
                            borderColor: '#49900B',
                        }}
                    >
                        {isProcessing ? (
                            <span className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Processing Payment...
                            </span>
                        ) : (
                            <span className="flex items-center text-2xl ">

                                YES! Add This to My Order
                            </span>
                        )}
                    </button>
                    <button onClick={skipUpsell}
                        disabled={isProcessing} className="text-left w-fit mx-auto">
                        <span className="text-[12px] text-[#8E8E8E] font-[OpenSans] ">
                            NO, I DON’T WANT TO TURBO CHARGE MY RESULTS
                        </span>
                    </button>


                    {error && (
                        <div className="border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
                            {success}
                        </div>
                    )}
                </div>
                <img className='mx-auto my-10 h-[40px]' src="./images/upsell-certified.webp" alt="certified" />
            </div>
        </div>
    );
};

export default UpsellPage;