"use client";
import { useEffect } from "react";
import { Clock, Globe, Package } from "lucide-react";
import { bundles } from "../constants/bundle";


type PackageFormProps = {
  data: {
    selectedBundleId: number;
    expeditedShipping: boolean;
    price: number;
    quantity:number;
  };
  updateFields: (fields: any) => void;
};




export default function PackageForm({ data, updateFields }: PackageFormProps) {
 useEffect(() => {
  const selected = bundles.find((b) => b.id === data.selectedBundleId);
  if (selected) {
    updateFields({
      price: selected.price,
      quantity: selected.quantity,
    });
  }
}, [data.selectedBundleId]);


  return (
    <div className=" rounded-lg p-6 shadow-lg min-w-[350px] ">
      {/* Free Shipping Banner */}
      <div className="bg-[#fcf8e3] border border-blue-200 rounded-lg p-4 mb-4 text-center">
        <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
          <Globe className="w-5 h-5" />
          FREE Shipping WORLDWIDE!
        </div>
      </div>

      {/* Stock Warning */}
      <div className="bg-[#f8f8f8] border-solid border-1 rounded-lg p-4 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 text-red-600 font-medium">
          <Clock className="w-5 h-5" />
          LIMITED STOCK! Cart reserved for 10:00
        </div>
      </div>

      {/* Bundle Selection */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-4">STEP 1: PICK YOUR BUNDLE DISCOUNT</h3>
        <p className="text-gray-600 mb-4">Buy multiple units and save even more!</p>

        <div className="space-y-3">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className={`border-2 h-[75px] rounded-lg  cursor-pointer transition-all px-2  ${data.selectedBundleId === bundle.id
                ? "border-[#B88720]"
                : "border-gray-200 hover:border-gray-300"
                } ${bundle.id === 1 ? "bg-[#ffff00] shadow-xl" : ""}`}
              onClick={() => updateFields({ selectedBundleId: bundle.id })}
            >
              <div className="flex items-center justify-between ">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="bundle"
                    checked={data.selectedBundleId === bundle.id}
                    onChange={() => updateFields({ selectedBundleId: bundle.id })}
                    className="w-4"
                  />
                  <div className="flex items-center gap-2 ">
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      {/* <Package className="w-6 h-6 text-gray-500" /> */}
                      <img src="./images/bundel-3.webp" alt="" />
                    </div>
                    <div>
                      {bundle.savings && (
                        <div
                          className={"text-[12px] font-semibold  px-2 py-1 rounded inline-block  text-[#f00000]" }
                        >
                          {bundle.savings}
                        </div>
                      )}
                      <div className="text-[15px]">{bundle.label}</div>

                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 line-through">
                    ${bundle.originalPrice}
                  </div>
                  <div className=" text-[15px] font-bold text-[#252a32]] ">
                    ${bundle.price}/bottle
                  </div>
                  <div className="text-xs text-[#252a32]]">+ FREE SHIPPING</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expedited Shipping */}
      {/* <div className="border-2 border-dashed  rounded-lg p-4 mb-6 bg-[#fbf8f3] flex flex-col">
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.expeditedShipping}
              onChange={(e) => updateFields({ expeditedShipping: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-[#009922] text-xs font-semibold">
              Yes, I want Expedited Shipping for ONLY $10!
            </span>
          </label>

        </div>

        <div className="grid grid-cols-4">
          <div className="">
            <img src="./images/expedited-truck.avif" alt="" />
          </div>
          <span className="text-gray-800 font-opensans text-[14px] col-span-3 m-2" style={{fontFamily : "Roboto , sans-serif"}}>
             <strong className="text-[#E60000]">Expedited Shipping:</strong> Want express shipping with your order? Select the Expedited Shipping option for just. Exclusive shipping and tracking service with delivery time up to 3-6 business days!
          </span>

          <div>

          </div>
        </div>
      </div> */}
    </div>
  );
}