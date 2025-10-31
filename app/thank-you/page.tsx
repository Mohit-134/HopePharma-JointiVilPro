'use client';
import React, { useState, useEffect } from 'react';
import { WIRELESS_CONTENT, TERMS_CONTENT, PRIVACY_CONTENT } from '../constants/modal';

const ThankYou = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [totalQuantity, setTotalQuantity] = useState(0); // ✅ NEW: state for total quantity

  const handleOpenModal = (type: string) => {
    if (type === 'terms') {
      setModalContent(TERMS_CONTENT);
    } else if (type === 'privacy') {
      setModalContent(PRIVACY_CONTENT);
    } else if (type === 'wireless') {
      setModalContent(WIRELESS_CONTENT);
    }
    setIsModalOpen(true);
  };

  // ✅ FIX: UseEffect to access localStorage safely
  useEffect(() => {
    const latestPackage = localStorage.getItem('latestPackage');
    const upsellPackage = localStorage.getItem('upsellPackage');

    const latestQuantity = latestPackage ? JSON.parse(latestPackage)?.quantity || 0 : 0;
    const upsellQuantity = upsellPackage ? JSON.parse(upsellPackage)?.quantity || 0 : 0;

    setTotalQuantity(latestQuantity + upsellQuantity);
  }, []);

  // Optional: Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  const Modal = ({ content, onClose }: any) => (
    <div className="fixed inset-0 z-50 flex justify-center items-center text-start">
      <div className="bg-white max-h-[90vh] overflow-y-auto p-6 rounded-md max-w-xl w-full relative">
        <button
          className="absolute top-1 left-[95%] text-red-500 font-bold text-xl"
          onClick={onClose}
        >
          ✕
        </button>
        <p
          className="text-sm border-1 p-4 text-gray-900 whitespace-pre-line leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-[#FFFFF] min-h-[100vh] h-full w-full p-4 text-center">
      <div className="max-w-[900px] mx-auto flex flex-col items-center justify-center gap-4">
        <img className="h-[150px]" src="./images/hopepharma.webp" alt="Hope Pharma" />
        <h1 className="text-7xl font-extrabold text-[#2f2f2f]">Thank You</h1>
        <p className="text-3xl">Your Order was Completed Successfully. </p>
        <div className="flex flex-col items-center text-center">
          <p className="text-[18px]">
            You Will Receive The Order Within <strong>15-18 Business Days.</strong>
          </p>
          <p className="text-[16px]">
            We will do our best to{' '}
            <span className="underline font-extrabold">deliver before then as well</span>
          </p>
        </div>
      {/* {product receipt} */}
        {/* <div className="w-full p-4">
          <div className="bg-[#eae4da] w-[100%] flex items-center gap-2 p-4 rounded-md mx-auto">
            <img className="h-[30px]" src="./images/check.webp" alt="" />
            <p className="text-start font-bold text-[#2f2f2f] text-2xl">Your Product Receipt:</p>
          </div>
          <div className="border-b-1 border-b-gray-300 flex justify-between items-center m-4 pb-4">
            <p className="text-start text-sm font-bold text-[#2f2f2f]">Product</p>
            <p className="text-start text-sm font-bold text-[#2f2f2f]">FortiVir</p>
          </div>
          <div className="flex justify-between items-center m-4 pb-4">
            <p className="text-start text-sm font-bold text-[#2f2f2f]">Quantity</p>
            <p className="text-start text-sm font-bold text-gray-400">{totalQuantity}</p>
          </div>
        </div> */}

        <div className="gap-0">
          <p className="text-2xl">For any support to your order, you can contact</p>
          <p className="text-2xl">customerservice@hopepharma.online</p>
        </div>
      </div>

      <div className="bg-[#F6FBFF] flex flex-col items-center justify-center w-full gap-4 py-8 mt-8 sticky top-[100%]">
        <img className="h-[80px]" src="./images/hopepharma.webp" alt="Hope Pharma Logo" />
        <div className="max-w-[300px] w-full">
          <ul className="text-[#235272] text-xs flex w-full justify-around">
            <li className="cursor-pointer" onClick={() => handleOpenModal('terms')}>
              Terms & Conditions
            </li>
            <li className="cursor-pointer" onClick={() => handleOpenModal('privacy')}>
              Privacy Policy
            </li>
            <li className="cursor-pointer" onClick={() => handleOpenModal('wireless')}>
              Wireless Policy
            </li>
          </ul>
        </div>
        <p className="text-xs">© 2024 Hope Pharma. All rights reserved.</p>
        <p className="text-xs">customerservice@hopepharma.online</p>
        <img src="./images/dmca.webp" alt="" />
      </div>

      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black opacity-30 z-40"
            onClick={() => setIsModalOpen(false)}
          />
          <Modal className="p-4" content={modalContent} onClose={() => setIsModalOpen(false)} />
        </>
      )}
    </div>
  );
};

export default ThankYou;
