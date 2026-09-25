"use client";

import { useState } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  Zap,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import api from "../../services/api";
import { registerDevice } from "../../services/deviceApi";

export default function RegisterForm() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMobileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      setMobile(value);
    }
  };

  const sendOTP = async () => {
    if (mobile.length !== 10) {
      alert(
        "Please enter a valid 10 digit mobile number."
      );
      return;
    }

    try {
  setLoading(true);

  // ==========================================
  // DEVICE ID
  // ==========================================

  let deviceId = localStorage.getItem("deviceId");

if (!deviceId) {
  const deviceResponse = await registerDevice();

  console.log("DEVICE RESPONSE:", deviceResponse);

  if (
    !deviceResponse?.status ||
    !deviceResponse?.device?.deviceId
  ) {
    alert(
      deviceResponse?.response ||
        "Unable to register device."
    );
    return;
  }

  deviceId = deviceResponse.device.deviceId;

  localStorage.setItem(
    "deviceId",
    deviceResponse.device.deviceId
  );
}

  const mobileNumber = `91${mobile}`;

      const { data } = await api.post(
        "/auth/phone/send-otp",
        {
          mobile: mobileNumber,
          type: "register",
        }
      );

      console.log(
        "REGISTER OTP RESPONSE:",
        data
      );

      if (!data?.success) {
        alert(
          data?.message ||
            "Unable to send OTP."
        );
        return;
      }

      if (!data?.requestId) {
        alert(
          "OTP request ID was not received."
        );
        return;
      }

      sessionStorage.setItem("requestId", data.requestId);

sessionStorage.setItem("mobile", mobileNumber);

sessionStorage.setItem("otpType", "register");

      router.push("/otp");

    } catch (error: any) {
      console.error(
        "REGISTER OTP ERROR:",
        error.response?.data ||
          error
      );

      alert(
        error.response?.data?.message ||
          "Unable to send OTP."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-slate-50">

      <div
        className="
          flex min-h-[100dvh]
          items-center
          justify-center
          sm:px-6
          sm:py-8
        "
      >

        <div
          className="
            relative
            flex
            min-h-[100dvh]
            w-full
            flex-col
            overflow-hidden
            bg-white

            sm:min-h-0
            sm:max-w-[390px]
            sm:rounded-[28px]
            sm:border
            sm:border-slate-200
            sm:shadow-xl
          "
        >

          {/* BLUE HEADER */}

          <div
            className="
              relative
              h-[205px]
              shrink-0
              overflow-hidden
              bg-gradient-to-br
              from-blue-700
              via-blue-600
              to-blue-500

              sm:h-[190px]
            "
          >

            <div
              className="
                absolute
                -right-16
                -top-16
                h-48
                w-48
                rounded-full
                bg-white/10
              "
            />

            <div
              className="
                absolute
                -left-12
                top-24
                h-36
                w-36
                rounded-full
                bg-white/10
              "
            />

            {/* LOGO */}

            <div
              className="
                relative
                z-10
                flex
                justify-center
                pt-11
              "
            >

              <div
                className="
                  flex
                  h-[68px]
                  w-[68px]
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/20
                  bg-white/15
                  backdrop-blur-sm
                "
              >

                <ShieldCheck
                  className="
                    h-10
                    w-10
                    text-white
                  "
                  strokeWidth={1.8}
                />

              </div>

            </div>

            {/* WAVE */}

            <div
              className="
                absolute
                -bottom-12
                left-[-10%]
                h-28
                w-[120%]
                rounded-[50%]
                bg-white
              "
            />

          </div>

          {/* CONTENT */}

          <div
            className="
              flex
              flex-1
              flex-col
              px-5
              pb-7
              pt-1
              sm:px-6
              sm:pb-8
            "
          >

            {/* TITLE */}

            <div className="text-center">

              <h1
                className="
                  text-[23px]
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                Create Account 🎉
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Register using your mobile number
              </p>

            </div>

            {/* MOBILE */}

            <div className="mt-8">

              <div
                className="
                  flex
                  h-12
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white

                  focus-within:border-blue-500
                  focus-within:ring-4
                  focus-within:ring-blue-100
                "
              >

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    border-r
                    border-slate-200
                    px-3
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  +91
                </div>

                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={handleMobileChange}
                  placeholder="Enter Mobile Number"
                  className="
                    h-full
                    min-w-0
                    flex-1
                    border-0
                    px-3
                    text-base
                    shadow-none
                    focus-visible:ring-0
                  "
                />

              </div>

            </div>

            {/* SEND OTP */}

            <Button
              onClick={sendOTP}
              disabled={
                loading ||
                mobile.length !== 10
              }
              className="
                mt-5
                h-12
                w-full
                rounded-xl
                bg-blue-600
                text-sm
                font-semibold
                hover:bg-blue-700
              "
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Send OTP
                </>
              )}
            </Button>

            {/* LOGIN */}

            <div
              className="
                mt-5
                text-center
              "
            >

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Already have an account?
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/login")
                }
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-blue-600
                  hover:text-blue-700
                "
              >
                Login
              </button>

            </div>


      

            {/* FEATURES */}

            <div
              className="
                mt-auto
                flex
                items-center
                justify-center
                gap-3
                pt-8
                text-[10px]
                text-slate-500
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >
                <LockKeyhole className="h-3 w-3" />
                Secure
              </div>

              <span>•</span>

              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >
                <Zap className="h-3 w-3" />
                Fast
              </div>

              <span>•</span>

              <div>
                Trusted
              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}