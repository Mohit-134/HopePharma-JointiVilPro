import React from 'react'
import { Sun, Lock } from 'lucide-react';


const Header = () => {
  return (
    <div className='min-w-[370px] w-screen mb-4'>
      <header className="bg-[#56766B] p-3 text-center text-white">
        <div className="flex items-center justify-center gap-2">
          <Sun className="h-5 w-5 text-amber-400" />
          <p className="font-semibold text-[22px]">Flash Sale</p>
        </div>
        <div >
          <p>
            <strong className="text-white">Enjoy a flash discount with</strong>
            <strong className="text-yellow-400"> FREE SHIPPING</strong>
            <strong className="text-white">
              . Limited inventory. <u className="underline">Sell Out Risk High.</u>
            </strong>
          </p>
        </div>
      </header>
      <div className="flex items-center justify-around px-3 sm:px-4  bg-[#E4EADA] ">
        <img
          src="./images/header1.webp"

          className="h-12 sm:h-16"
          style={{ maxWidth: "250px" }}
        />
        <h1 className='font-bold text-2xl hidden md:block'> SECURE CHECKOUT</h1>
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 mb-1">
              <Lock className="h-3 w-3 text-emerald-600" />
              <p className="text-xs font-medium text-gray-700 sm:text-sm">
                Secure Checkout
              </p>
            </div>
            <p className="text-xs text-gray-600 sm:text-sm">
              Support: "abcexamople.con"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
