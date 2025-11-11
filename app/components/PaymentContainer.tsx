"use client"
import React, { useEffect, useRef, useState } from 'react'
import CryptoJS from 'crypto-js';

const PaymentContainer = (props: any) => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const sessionInitialized = useRef(false);
    const sessionRef = useRef<any>(null);

    const { package: packageData, user, shipment, shouldUpdateSession } = props;

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://pay.mobibox.io/sdk/pay-session.js";
        script.async = true;

      script.onload = () => {
          console.log("✅ Mobibox SDK loaded");
          if (!sessionInitialized.current) {
              initSession();
              sessionInitialized.current = true;
          }
      };

      script.onerror = () => {
          console.error("❌ Failed to load Mobibox SDK");
          setError("Failed to load payment system");
      };

      document.body.appendChild(script);

      return () => {
          if (script.parentNode) script.parentNode.removeChild(script);
      };
  }, []);

    const createPaymentSession = async () => {
      if (shouldUpdateSession === false) {
          document.getElementById('errorSection')?.scrollIntoView({ behavior: 'smooth' });
        return null;
    }

      const order_number = `ORDER-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const rawAmount = packageData.price * packageData.quantity + (packageData.expeditedShipping ? 10.0 : 0.0);
      const order_amount = Number(rawAmount.toFixed(2));
      const order_currency = "USD";
      const order_description = "Jointivil Purchase";
      const merchant_pass = process.env.NEXT_PUBLIC_MERCHANT_PASS;

      // Hash for security
      const to_md5 = (order_number + order_amount + order_currency + order_description + merchant_pass).toUpperCase();
      const md5Hash = CryptoJS.MD5(to_md5).toString();
      const sha1Hash = CryptoJS.SHA1(md5Hash).toString(CryptoJS.enc.Hex);

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
        customer: { name: user.name + " " + user.surname },
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
        hash: sha1Hash
    };

      try {
        const res = await fetch('/api/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`Session creation failed: ${res.status}`);

        const data = await res.json();
        console.log('✅ Session created:', data);
        localStorage.setItem('latestPackage', JSON.stringify(packageData));
          return data;
      } catch (err) {
          console.error('❌ Error creating session:', err);
          setError('Failed to create payment session');
          return null;
      }
  };

    const initSession = async () => {
        const logEl = document.getElementById("log");

      function writeLog(msg: string) {
          if (!logEl) return;
          const d = document.createElement("div");
          d.textContent = msg;
          logEl.appendChild(d);
          console.log(msg);
      }

      if (typeof (window as any).PaySession === "undefined") {
          console.error("PaySession SDK not loaded yet");
          return;
      }

      // If in production, generate session from backend
      let sessionData: any = { sandbox: true }; // Default sandbox
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
          sessionData = await createPaymentSession();
          if (!sessionData) return; // abort if session creation failed
      }

      // Initialize Mobibox PaySession
      const session = new (window as any).PaySession({
          formName: "paymentForm",
          validateOnInput: true,
          sandbox: sessionData?.sandbox || false,
          sessionId: sessionData?.sessionId || undefined, // only in production
      });

      sessionRef.current = session;

      session.onFormReady = () => writeLog("✅ Form ready. State: " + (session.getSessionState?.() || "n/a"));
      session.onInputValidation = ({ result, inputId }: any) => {
          const el = document.querySelector(`[data-error-for="${inputId}"]`) as HTMLElement | null;
          if (!el) return;
          const messages: Record<string, string> = {
              payer_card: "Enter a valid card number.",
              payer_cvv: "Enter a valid CVV.",
              payer_expiryDate: "Use MM/YY and a future date.",
              payer_name: "Full name is required.",
              payer_email: "Enter a valid email.",
              payer_zip: "Enter a valid ZIP.",
              payer_city: "Enter a valid city.",
              payer_state: "Enter a valid state/region.",
              payer_address: "Enter a valid address.",
              payer_country: "Enter a valid country code.",
          };
          el.textContent = result === "error" ? messages[inputId] || "Invalid value." : "";
          el.style.display = result === "error" ? "block" : "none";
      };

      session.onDecline = ({ message }: any) => { writeLog("❌ Declined: " + message); alert(message || "Payment declined"); setLoading(false); };
      session.onSuccess = ({ successUrl }: any) => { writeLog("✅ Success, redirecting to: " + successUrl); window.location.href = successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}thank-you`; };
      session.onUndefined = () => writeLog("⚠️ Undefined case");
      session.handleError = (err: any) => { writeLog("💥 Error: " + (err?.message || JSON.stringify(err))); setError(err?.message || "Payment error"); setLoading(false); };

      try {
        session.setGooglePayButtonConfiguration({
            buttonColor: "default",
            buttonType: "buy",
            buttonRadius: 6,
            buttonLocale: "en",
            buttonSizeMode: "static",
        });
      } catch (e) { console.warn("Google Pay config failed:", e); }

      (window as any).handleApplePayClick = () => writeLog("🍎 Apple Pay requested…");

      try { session.begin(); writeLog("Session begin requested."); } catch (e) { writeLog("Begin failed: " + (e as Error)?.message); }
  };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (shouldUpdateSession === false) {
            document.getElementById('errorSection')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
      setLoading(true);

      // For production, we must create a session before submitting
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
          const data = await createPaymentSession();
          if (!data) {
              setLoading(false);
              return;
          }
          sessionRef.current?.setSessionId?.(data.sessionId); // Update session ID
      }
  };

    if (error && !sessionInitialized.current) {
        return (
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center text-red-600">
              <p>Error: {error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
          </div>
      );
  }

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <form id="paymentForm" className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
              <h2 className="text-lg font-semibold text-gray-800 mt-2">Card details</h2>
              <div className="grid grid-cols-1 gap-4">
                  <div className="field">
                      <label htmlFor="payer_card" className="block text-sm font-medium text-gray-700 mb-1">Card number</label>
                      <input id="payer_card" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="4111 1111 1111 1111" required />
                      <small className="text-red-500 text-xs mt-1 hidden" data-error-for="payer_card"></small>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="field">
                          <label htmlFor="payer_expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                          <input id="payer_expiryDate" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="MM/YY" required />
                          <small className="text-red-500 text-xs mt-1 hidden" data-error-for="payer_expiryDate"></small>
                      </div>
                      <div className="field">
                          <label htmlFor="payer_cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <input id="payer_cvv" type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="123" required />
                          <small className="text-red-500 text-xs mt-1 hidden" data-error-for="payer_cvv"></small>
                      </div>
                  </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-800 mt-4">Billing address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="field">
                      <label htmlFor="payer_name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                      <input id="payer_name" type="text"  defaultValue={`${user.name} ${user.surname}`} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" required />
                      <small className="text-red-500 text-xs mt-1 hidden" data-error-for="payer_name"></small>
                  </div>
                  <div className="field">
                      <label htmlFor="payer_email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input id="payer_email" type="email"   defaultValue= {`${user.email}`} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="name@example.com" />
                      <small className="text-red-500 text-xs mt-1 hidden" data-error-for="payer_email"></small>
                  </div>
              </div>

              <button type="submit" disabled={isLoading} className="bg-[#ffd712] text-black font-semibold py-3 rounded-lg shadow-lg hover:bg-[#ffdb28] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'Processing...' : 'COMPLETE PURCHASE'}
              </button>
          </form>

          <div id="log" className="mt-6 text-xs bg-gray-100 p-3 rounded text-left text-gray-600 overflow-y-auto max-h-48" aria-live="polite"></div>
          <footer className="mt-6 text-center text-gray-500 text-sm">TRY IT RISK FREE! - 90 DAY MONEY BACK GUARANTEE!</footer>
      </div>
  );
};

export default PaymentContainer;
