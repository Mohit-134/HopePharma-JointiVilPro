"use client";
import { useEffect, useReducer, useState } from "react";
import PackageForm from "./PackageForm";
import UserDetailsForm from "./UserDetailsForm";
import { Files, Lock } from "lucide-react";
import PaymentContainer from "./PaymentContainer";
import ShipmentDetailsForm from "./ShipmentDeatilsForm";
import Header from "../components/Header";


export default function Checkout() {

  const initialState = {
    package: {
      selectedBundleId: 3,
      price: 59.99,
      expeditedShipping: false,
      originalPrice: 19913,
      quantity: 2,
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

    console.log("updating package with", action.payload);
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


  const allFormsValid = validationState.package && validationState.user && validationState.shipment;



  const updateValidation = (form: keyof typeof validationState, isValid: boolean) => {
    setValidationState(prev => ({
      ...prev,
      [form]: isValid
    }));
  };

  useEffect(() => {
    // Track checkout event
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout')
    }
  }, [])

  useEffect(() => {
    console.log("data", state);
    console.log("validation state", validationState);
    console.log("all forms valid", allFormsValid);
  }, [state, validationState, allFormsValid]);


  return (
    <div className="  w-screen min-w-[400px] overflow-x-hidden "
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <div className=" w-[100%] max-w-[1200px] mx-auto mb-10 pb-10  border-[0px] shadow-2xl flex flex-wrap items- justify-center gap-4   bg-amber-60" >
        <Header />
        <div className=" p-4 border-1 w-full min-w-[400px] max-w-[575px] ">
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
        <div className=" w-full max-w-[575px] min-w-[400px] border-1 p-4 ">
          <PaymentContainer
            package={state.package}
            user={state.user}
            shipment={state.shipment}
            shouldUpdateSession={allFormsValid}
          />

          <p className="text-[#67697EE6]  text-[13px] text-center p-4">By completing the payment, the client is in agreement with our Terms of Service and Refund Policy.</p>
          <img className="w-[70%]  mx-auto" src="./images/payment-gateway.webp"></img>
          <p className="flex  mx-auto justify-center my-6 text-[#303030] text-[13px] items-center"> <Lock color="#f7ef02" /> Secure 256-bit SSL encryption  </p>
          <div className="grid grid-cols-6 my-2 p-2 mx-auto gap-2  w-[100%]">
            <img className="col-span-2 max-h-[130px]  " src="./images/guarantee-sticker.webp"></img>
            <div className="col-span-4 w-[100%] ">
              <p className="text-[#303030] mb-1.5"><strong> 90 DAYS GUARANTEE</strong> </p>
              <p className="text-[#303030] text-[13px] tracking-tight">
                If you are not completely thrilled with your jointiVil - we are offering you a 90 day guarantee on all purchases. Simply contact  our customer support for a full refund or replacement.</p>
            </div>
          </div>
          {/* reviews */}

          <div className="grid grid-cols-10 my-10">
            <img className="h-[40px] col-span-1 rounded-full" src="./images/user1.webp" alt="" />

            <div className="relative bg-[#f0f2f5] p-4 rounded-lg col-span-9">
              <strong className="text-[#000000] text-[15px]">Ethan</strong>
              <p className="text-[#000000] text-[15px]">
                After using jointiVil for a few weeks, I've noticed a significant improvement in my joint flexibility and a reduction in pain. It's been a game-changer for my daily activities, and I feel more mobile than ever!
              </p>

              {/* Overlapping like count */}
              <div className=" min-w-[60x] absolute -bottom-3 left-[75%] sm:left-[80%] tracking-widest bg-white px-3 py-1 rounded-lg text-[14px] shadow-md">
                27 <span className="tracking-tighter">👍❤️</span>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-10 my-10">
            <img className="h-[40px] col-span-1 rounded-full" src="./images/user2.webp" alt="" />

            <div className="relative bg-[#f0f2f5] p-4 rounded-lg col-span-9">
              <strong className="text-[#000000] text-[15px]">Ethan</strong>
              <p className="text-[#000000] text-[15px]">
                JointiVil has helped ease the discomfort in my knees and joints. I'm now able to move with less pain, and my recovery after workouts is much faster. I highly recommend it to anyone dealing with joint issues!
              </p>

              {/* Overlapping like count */}
              <div className=" min-w-[60x] absolute -bottom-3 left-[75%] sm:left-[80%] tracking-widest bg-white px-3 py-1 rounded-lg text-[14px] shadow-md">
                32 <span className="tracking-tighter">👍❤️</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}




