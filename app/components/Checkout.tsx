"use client";
import { useEffect, useReducer, useState } from "react";
import PackageForm from "./PackageForm";
import UserDetailsForm from "./UserDetailsForm";
import { Files, Lock } from "lucide-react";
import PaymentContainer from "./PaymentContainer";
import ShipmentDetailsForm from "./ShipmentDeatilsForm";


export default function Checkout() {

  const initialState = {
    package: {
      selectedBundleId: 1,
      price: 3318,
      expeditedShipping: false,
      originalPrice: 49783,
      quantity: 5,
    },
    user: {
      name: "",
      surname: "",
      email: "",
      phone: "",
    },
    shipment: {
      country: "",
      address: "",
      city: "",
      state: "",
      postcode: "",
    }
  };


  type State = typeof initialState;

  type Action =
    | { type: "UPDATE_PACKAGE"; payload: Partial<State["package"]> }
    | { type: "UPDATE_USER"; payload: Partial<State["user"]> }
    | { type: "UPDATE_SHIPMENT"; payload: Partial<State["shipment"]> };

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "UPDATE_PACKAGE":
        return {
          ...state,
          package: { ...state.package, ...action.payload },
        };
      case "UPDATE_USER":
        return {
          ...state,
          user: { ...state.user, ...action.payload },
        };
      case "UPDATE_SHIPMENT":
        return {
          ...state,
          shipment: { ...state.shipment, ...action.payload },
        };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);


  const [validationState, setValidationState] = useState({
    package: true, //  package is always valid 
    user: false,
    shipment: false
  });

 

  // Track if all forms are valid
  const allFormsValid = validationState.package && validationState.user && validationState.shipment;
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

    const updateValidation = (form: keyof typeof validationState, isValid: boolean) => {
    setValidationState(prev => ({
      ...prev,
      [form]: isValid
    }));
  };

 useEffect(() => {
    console.log("data", state);
    console.log("validation state", validationState);
    console.log("all forms valid", allFormsValid);
  }, [state, validationState, allFormsValid]);


  return (
    <div className=""
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <div className=" w-screen max-w-[1200px] mx-auto mb-10 pb-10  border-[0px] shadow-2xl flex flex-wrap items- justify-center gap-4  px-2 " >

        <div className="  border-solid border-1 w-full  max-w-[575px] p-2">
          <PackageForm
            data={state.package}
            updateFields={(fields) => { dispatch({ type: "UPDATE_PACKAGE", payload: fields }) }}
          ></PackageForm>

          <UserDetailsForm
            data={state.user}
            updateFields={(fields) => { dispatch({ type: "UPDATE_USER", payload: fields }) }}
            onValidationChange={(isValid) => updateValidation('user', isValid)}
          ></UserDetailsForm>

          <ShipmentDetailsForm
            data={state.shipment}
            updateFields={(fields) => { dispatch({ type: "UPDATE_SHIPMENT", payload: fields }) }}
            onValidationChange={(isValid) => updateValidation('shipment', isValid)}
          ></ShipmentDetailsForm>

        </div>
        <div className=" w-full max-w-[575px]  border-1 p-4 ">
          <PaymentContainer
            package={state.package}
            user={state.user}
            shipment={state.shipment}
            shouldUpdateSession={allFormsValid}
          />
          <div className="bg-[#ffd712] h-[100px] w-full min-w-[340px] flex flex-col items-center justify-center gap-2 rounded-lg shadow-lg text-center">
            <p className="font-bold">COMPLETE PURCHASE</p>
            <p>TRY IT RISK FREE! - 90 DAY MONEY BACK GUARANTEE!</p>
          </div>
          <p className="text-[#67697EE6]  text-[13px] text-center p-4">By completing the payment, the client is in agreement with our Terms of Service and Refund Policy.</p>
          <img className="w-[70%]  mx-auto" src="./images/payment-gateway.webp"></img>
          <p className="flex gap-2 mx-auto justify-center my-6 text-[#303030] text-[13px] items-center"> <Lock color="#f7ef02" /> Secure 256-bit SSL encryption  </p>
          <div className="grid grid-cols-5 gap-2 my-2 p-2 mx-auto min-w-[350px]">
            <img className="col-span-1 h-[100px]" src="./images/guarantee-sticker.webp"></img>
            <div className="col-span-4">
              <p className="text-[#303030] mb-1.5"><strong> 90 DAYS GUARANTEE</strong> </p>
              <p className="text-[#303030] text-[13px] tracking-tight">
                If you are not completely thrilled with your FORTIVIR MAX - we are offering you a 90 day guarantee on all purchases. Simply contact our customer support for a full refund or replacement.</p>
            </div>
          </div>
          {/* reviews */}

          <div className="grid grid-cols-10 my-10">
            <img className="h-[40px] col-span-1 rounded-full" src="./images/user1.webp" alt="" />

            <div className="relative bg-[#f0f2f5] p-4 rounded-lg col-span-9">
              <strong className="text-[#000000] text-[15px]">Ethan</strong>
              <p className="text-[#000000] text-[15px]">
                fortivir has been a real life-changer for me! My performance has improved significantly, and I feel more confident in every aspect of my life. I’ve regained the energy and strength I was missing!
              </p>

              {/* Overlapping like count */}
              <div className="absolute -bottom-3 left-[80%] tracking-widest bg-white px-3 py-1 rounded-lg text-[14px] shadow-md">
                27 <span className="tracking-tighter">👍❤️</span>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-10 my-10">
            <img className="h-[40px] col-span-1 rounded-full" src="./images/user2.webp" alt="" />

            <div className="relative bg-[#f0f2f5] p-4 rounded-lg col-span-9">
              <strong className="text-[#000000] text-[15px]">Ethan</strong>
              <p className="text-[#000000] text-[15px]">
                fortivir has been a real life-changer for me! My performance has improved significantly, and I feel more confident in every aspect of my life. I’ve regained the energy and strength I was missing!
              </p>

              {/* Overlapping like count */}
              <div className="absolute -bottom-3 left-[80%] tracking-widest bg-white px-3 py-1 rounded-lg text-[14px] shadow-md">
                27 <span className="tracking-tighter">👍❤️</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
