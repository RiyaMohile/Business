"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { Button } from "../ui/button";
import api from "../../services/api";

export default function OtpForm() {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [requestId, setRequestId] = useState("");
  const [mobile, setMobile] = useState("");

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(60);
  const [deviceId, setDeviceId] =
  useState("");

  const inputRefs = useRef<
    Array<HTMLInputElement | null>
  >([]);

  // ==========================================
  // GET LOCAL STORAGE DATA
  // ==========================================

  useEffect(() => {
  setRequestId(
    sessionStorage.getItem("requestId") || ""
  );

  setMobile(
    sessionStorage.getItem("mobile") || ""
  );

  setDeviceId(
    localStorage.getItem("deviceId") || ""
  );

  setMounted(true);
}, []);
  // ==========================================
  // RESEND TIMER
  // ==========================================

  useEffect(() => {
    if (!mounted) return;

    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, mounted]);

  // ==========================================
  // OTP INPUT
  // ==========================================

  const handleOtpChange = (
  index: number,
  value: string
) => {
  const digit = value.replace(/\D/g, "").slice(-1);

  const otpArray = otp.padEnd(4, "").split("");

  // Agar digit enter kiya
  if (digit) {
    otpArray[index] = digit;

    const newOtp = otpArray.join("");
    setOtp(newOtp);

    // Next box par focus
    if (
      index < 3 &&
      inputRefs.current[index + 1]
    ) {
      inputRefs.current[index + 1]?.focus();
    }

    return;
  }

  // Agar digit delete kiya
  otpArray[index] = "";

  setOtp(otpArray.join(""));
};

  // ==========================================
  // BACKSPACE
  // ==========================================

  const handleKeyDown = (
  index: number,
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  if (
    e.key === "Backspace" &&
    !otp[index] &&
    index > 0
  ) {
    inputRefs.current[index - 1]?.focus();
  }
};

  // ==========================================
  // PASTE OTP
  // ==========================================

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (!pastedOtp) return;

    setOtp(pastedOtp);

    const focusIndex = Math.min(
      pastedOtp.length - 1,
      3
    );

    inputRefs.current[focusIndex]?.focus();
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const verifyOTP = async () => {
  if (otp.length !== 4) {
    alert("Enter a valid 4 digit OTP");
    return;
  }

  if (!requestId) {
    alert(
      "OTP session expired. Please request OTP again."
    );

    router.push("/login");
    return;
  }

  // IMPORTANT: deviceId must exist before API call
  if (!deviceId) {
    alert(
      "Device ID not found. Please login again."
    );

    router.push("/login");
    return;
  }

    const otpType = sessionStorage.getItem("otpType");

  try {
    setLoading(true);

    const response = await api.post(
      "http://localhost:5000/v2/api/auth/phone/login-user-otp",
      {
        requestId,
        otp,
        deviceId,
      }
    );

    console.log(
      "LOGIN OTP RESPONSE:",
      response.data
    );

    const {
  token,
  userId,
} = response.data;

if (!token) {
  alert("Login token not received.");
  return;
}

if (!userId) {
  alert("User ID not received.");
  return;
}

localStorage.setItem(
  "token",
  token
);

localStorage.setItem(
  "userId",
  userId
);

localStorage.setItem(
  "deviceId",
  deviceId
);

// Remove temporary OTP data
sessionStorage.removeItem("requestId");
sessionStorage.removeItem("mobile");

if (otpType === "register") {
  router.replace("/business-dashboard/complete-profile");
} else {
  router.replace("/business-dashboard");
}

  } catch (err: any) {
    console.error(
      "OTP verification error:",
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
        "Invalid OTP. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  // ==========================================
  // RESEND OTP
  // ==========================================

  const resendOTP = async () => {
    if (!mobile) {
      alert("Mobile number not found.");
      return;
    }

    if (timer > 0) {
      return;
    }

    const otpType = sessionStorage.getItem("otpType");

    try {
      setLoading(true);

      await api.get(
        `/auth/phone/resend-otp?mobile=${mobile}`
      );

      setTimer(60);
      setOtp("");

      inputRefs.current[0]?.focus();

      alert("OTP sent again.");
    } catch (err: any) {
      console.error(
        "Resend OTP error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORMAT MOBILE
  // ==========================================

  const formattedMobile =
    mobile.length > 2
      ? `+${mobile.slice(0, 2)} ${mobile.slice(2)}`
      : mobile;

  // ==========================================
  // PREVENT SSR LOCAL STORAGE ISSUE
  // ==========================================

  if (!mounted) {
    return null;
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="min-h-[100dvh] bg-slate-50">

      {/* ======================================
          RESPONSIVE CONTAINER
      ======================================= */}

      <div className="flex min-h-[100dvh] items-center justify-center sm:px-6 sm:py-8">

        {/* ======================================
            AUTH CARD

            Mobile:
            Full screen

            Desktop:
            390px centered card
        ======================================= */}

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

          {/* ======================================
              BLUE HEADER
          ======================================= */}

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

            {/* Back Button */}

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="
                absolute
                left-5
                top-5
                z-20
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-white/15
                text-white
                backdrop-blur-sm
                transition
                hover:bg-white/25
              "
              aria-label="Back to login"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Decorative Circle */}

            <div
              className="
                absolute
                -right-16
                -top-16
                h-48
                w-48
                rounded-full
                bg-white/10

                sm:-right-10
                sm:-top-10
                sm:h-40
                sm:w-40
              "
            />

            {/* Second Decorative Circle */}

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

            {/* Logo */}

            <div
              className="
                relative
                z-10
                flex
                justify-center
                pt-11

                sm:pt-10
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

                  sm:h-16
                  sm:w-16
                "
              >
                <ShieldCheck
                  className="
                    h-10
                    w-10
                    text-white

                    sm:h-9
                    sm:w-9
                  "
                  strokeWidth={1.8}
                />
              </div>
            </div>

            {/* White Wave */}

            <div
              className="
                absolute
                -bottom-12
                left-[-10%]
                h-28
                w-[120%]
                rounded-[50%]
                bg-white

                sm:-bottom-10
                sm:h-24
              "
            />

          </div>

          {/* ======================================
              CONTENT
          ======================================= */}

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

            {/* ======================================
                TITLE
            ======================================= */}

            <div className="text-center">

              <h1
                className="
                  text-[23px]
                  font-bold
                  tracking-tight
                  text-slate-900

                  sm:text-[22px]
                "
              >
                Verify Your Number
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                OTP sent to{" "}

                <span className="font-medium text-slate-700">
                  {formattedMobile}
                </span>
              </p>

            </div>

            {/* ======================================
                OTP INPUTS
            ======================================= */}

            <div
              className="
                mt-8
                flex
                w-full
                justify-center
                gap-2.5

                sm:gap-3
              "
            >

              {[0, 1, 2, 3].map(
                (index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] =
                        element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={1}
                    value={
                      otp[index] || ""
                    }
                    onChange={(e) =>
                      handleOtpChange(
                        index,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(
                        index,
                        e
                      )
                    }
                    onPaste={handlePaste}
                    className="
                      h-12
                      w-12
                      shrink-0
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      text-center
                      text-xl
                      font-semibold
                      text-slate-900
                      outline-none
                      transition

                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-100

                      sm:h-14
                      sm:w-14
                    "
                    aria-label={`OTP digit ${
                      index + 1
                    }`}
                  />
                )
              )}

            </div>

            {/* ======================================
                VERIFY BUTTON
            ======================================= */}

            <Button
              onClick={verifyOTP}
              disabled={
                loading ||
                otp.length !== 4
              }
              className="
                mt-7
                h-13
                w-full
                rounded-xl
                bg-blue-600
                text-sm
                font-semibold
                shadow-sm
                hover:bg-blue-700

                sm:h-12
              "
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </Button>

            {/* ======================================
                RESEND OTP
            ======================================= */}

            <div className="mt-6 text-center">

              {timer > 0 ? (
                <p className="text-sm text-slate-500">

                  Resend OTP{" "}

                  <span
                    className="
                      font-semibold
                      text-blue-600
                    "
                  >
                    (
                    00:
                    {String(timer).padStart(
                      2,
                      "0"
                    )}
                    )
                  </span>

                </p>
              ) : (
                <button
                  type="button"
                  onClick={resendOTP}
                  disabled={loading}
                  className="
                    text-sm
                    font-semibold
                    text-blue-600
                    transition
                    hover:text-blue-700
                    disabled:opacity-50
                  "
                >
                  Resend OTP
                </button>
              )}

            </div>

            {/* ======================================
                SECURITY MESSAGE
            ======================================= */}

            <div className="mt-auto pt-8">

              <p
                className="
                  mx-auto
                  max-w-[280px]
                  text-center
                  text-[11px]
                  leading-5
                  text-slate-400
                "
              >
                Your OTP is secure and will
                only be used to verify your
                mobile number.
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}