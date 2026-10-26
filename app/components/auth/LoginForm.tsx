"use client";

import { useEffect, useState } from "react";
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
import AlertBox from "../common/AlertBox";
import { useAlert } from "../../hooks/useAlert";
import { registerDevice } from "../../services/deviceApi";

export default function LoginForm() {
  const {
  alert,
  showAlert,
  closeAlert,
} = useAlert();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    router.replace("/business-dashboard");
    return;
  }

  setCheckingAuth(false);
}, [router]);

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"otp" | "password">("otp");
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);

  

  const handleMobileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      setMobile(value);
    }
  };

  
const handlePasswordLogin = async () => {
  if (!username.trim() || !password) {
    showAlert("Please enter username and password.", "warning");
    return;
  }

  try {
    setLoading(true);

    
let deviceId: string | null = localStorage.getItem("deviceId");

if (!deviceId) {
  const deviceResponse = await registerDevice();

  const newDeviceId = deviceResponse?.device?.deviceId;

  if (!deviceResponse?.status || !newDeviceId) {
    showAlert("Unable to register device.", "error");
    return;
  }

  deviceId = newDeviceId;
  localStorage.setItem("deviceId", newDeviceId);
}


    // Call the existing backend login API
    const { data } = await api.post("/auth/login", {
      username: username.trim(),
      password,
      deviceId,
      platform: "business",
      deviceType: "web",
    });

    if (!data?.success || !data?.token) {
      showAlert(data?.message || "Login failed.", "error");
      return;
    }

    // Save login session
    localStorage.setItem("token", data.token);

    if (data.userId) {
      localStorage.setItem("userId", data.userId);
    }

    // Go to business dashboard
    router.replace("/business-dashboard");
  } catch (error: any) {
    console.error(
      "USERNAME PASSWORD LOGIN ERROR:",
      error?.response?.data || error
    );

    showAlert(
      error?.response?.data?.message ||
        "Invalid username or password.",
      "error"
    );
  } finally {
    setLoading(false);
  }
};


const sendOTP = async () => {
  if (mobile.length !== 10) {
    showAlert(
      "Please enter a valid 10 digit mobile number.",
      "warning"
    );
    return;
  }

  try {
    setLoading(true);

    // ==========================================
    // CHECK DEVICE ID
    // ==========================================

    let deviceId = localStorage.getItem("deviceId");

    if (deviceId) {
      console.log(
        "DEVICE ID ALREADY EXISTS:",
        deviceId
      );
    }

    // ==========================================
    // FALLBACK: GENERATE DEVICE ID
    // ==========================================

    if (!deviceId) {
      console.log(
        "DEVICE ID NOT FOUND - REGISTERING DEVICE..."
      );

      try {
        const deviceResponse = await registerDevice();

        console.log(
          "DEVICE REGISTRATION RESPONSE:",
          deviceResponse
        );

        if (
          !deviceResponse?.status ||
          !deviceResponse?.device?.deviceId
        ) {
          showAlert(
            "Unable to register device.",
            "error"
          );
          return;
        }

        const newDeviceId =
  deviceResponse.device.deviceId;

deviceId = newDeviceId;

localStorage.setItem(
  "deviceId",
  newDeviceId
);

        console.log(
          "DEVICE ID GENERATED AND SAVED:",
          deviceId
        );

      } catch (error: any) {
        console.error(
          "DEVICE REGISTRATION ERROR:",
          error?.response?.data ||
            error?.message ||
            error
        );

        showAlert(
          "Unable to register device. Please try again.",
          "error"
        );

        return;
      }
    }

    // ==========================================
    // SEND OTP
    // ==========================================

    const mobileNumber = `91${mobile}`;

    console.log(
      "SENDING OTP FOR:",
      mobileNumber
    );

    console.log(
      "USING DEVICE ID:",
      deviceId
    );

    const { data } = await api.post(
      "/auth/phone/send-otp",
      {
        mobile: mobileNumber,
        type: "login",
      }
    );

    console.log(
      "LOGIN OTP RESPONSE:",
      data
    );

    // ==========================================
    // OTP RESPONSE CHECK
    // ==========================================

    if (!data?.success) {
      showAlert(
        data?.message ||
          "Unable to send OTP.",
        "error"
      );
      return;
    }

    if (!data?.requestId) {
      showAlert(
        "OTP request ID was not received.",
        "error"
      );
      return;
    }

    // ==========================================
    // SAVE OTP DATA
    // ==========================================

    sessionStorage.setItem(
      "requestId",
      data.requestId
    );

    sessionStorage.setItem(
      "mobile",
      mobileNumber
    );

    sessionStorage.setItem(
      "otpType",
      "login"
    );

    // ==========================================
    // GO TO OTP PAGE
    // ==========================================

    router.push("/otp");

  } catch (error: any) {
    console.error(
      "LOGIN ERROR:",
      error?.response?.data ||
        error
    );

    showAlert(
      error?.response?.data?.message ||
        "Unable to continue.",
      "error"
    );

  } finally {
    setLoading(false);
  }
};
if (checkingAuth) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
      <div className="text-sm text-slate-500">
        Loading...
      </div>
    </main>
  );
}
  return (
    <main className="min-h-[100dvh] bg-slate-50">

      <div className="flex min-h-[100dvh] items-center justify-center sm:px-6 sm:py-8">

        <div
          className="
            relative flex min-h-[100dvh] w-full
            flex-col overflow-hidden bg-white

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
              relative h-[205px] shrink-0
              overflow-hidden
              bg-gradient-to-br
              from-blue-700
              via-blue-600
              to-blue-500
              sm:h-[190px]
            "
          >

            {/* Decorative circles */}

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

            {/* Logo */}

            <div className="relative z-10 flex justify-center pt-11">

              <div
                className="
                  flex h-[68px] w-[68px]
                  items-center justify-center
                  rounded-2xl
                  border border-white/20
                  bg-white/15
                  backdrop-blur-sm
                "
              >
                <ShieldCheck
                  className="h-10 w-10 text-white"
                  strokeWidth={1.8}
                />
              </div>

            </div>

            {/* Wave */}

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
              flex flex-1 flex-col
              px-5 pb-7 pt-1
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
                Welcome Back 👋
              </h1>

              <p className="mt-1 text-sm text-slate-500">
  {loginMode === "otp"
    ? "Login using OTP"
    : "Login using Username & Password"}
</p>

            </div>


            {loginMode === "otp" ? (
              <>

            {/* MOBILE */}

            <div className="mt-8">

              <div
                className="
                  flex h-12 overflow-hidden
                  rounded-xl
                  border border-slate-200
                  bg-white

                  focus-within:border-blue-500
                  focus-within:ring-4
                  focus-within:ring-blue-100
                "
              >

                <div
                  className="
                    flex shrink-0 items-center
                    border-r border-slate-200
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

            <Button
  type="button"
  variant="outline"
  onClick={() => setLoginMode("password")}
  className="mt-3 h-12 w-full rounded-xl border-blue-200
    bg-white text-sm font-semibold text-blue-700 hover:bg-blue-50"
>
  Login with Username & Password
</Button>

            </>
            ) : (
              <>

              
  {/* USERNAME */}
  <div className="mt-8">
    <label className="mb-2 block text-sm font-medium text-slate-700">
      Username
    </label>

    <Input
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      placeholder="Enter username"
      autoComplete="username"
      className="h-12 rounded-xl"
    />
  </div>

  {/* PASSWORD */}
  <div className="mt-4">
    <label className="mb-2 block text-sm font-medium text-slate-700">
      Password
    </label>

    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        autoComplete="current-password"
        className="h-12 rounded-xl pr-16"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2
          text-sm font-medium text-blue-600"
      >
        {showPassword ? "Hide" : "Show"}
      </button>
    </div>
  </div>

  {/* CONFIRM LOGIN */}
  <Button
    type="button"
    onClick={handlePasswordLogin}
    disabled={loading || !username.trim() || !password}
    className="mt-5 h-12 w-full rounded-xl bg-blue-600
      text-sm font-semibold hover:bg-blue-700"
  >
    {loading ? "Signing in..." : "Confirm Login"}
  </Button>

  {/* BACK TO OTP */}
  <button
    type="button"
    onClick={() => setLoginMode("otp")}
    className="mt-4 w-full text-sm font-semibold text-blue-600"
  >
    Back to OTP Login
  </button>
  </>
)}


            {/* REGISTER */}

            <div className="mt-12 text-center">

              <p className="text-xs text-slate-500">
                Don't have an account?
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/register")
                }
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-blue-600
                  hover:text-blue-700
                "
              >
                Create Account
              </button>

            </div>

            {/* PRIVACY / TERMS */}

<div className="mt-auto pt-8 text-center">

  <p className="text-xs leading-6 text-slate-500">
    By using Thover Business, you must accept our
  </p>

  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-semibold">

    <button
      type="button"
      onClick={() =>
        router.push("/business-dashboard/about/business-privacy-policy")
      }
      className="
        text-blue-600
        hover:text-blue-700
        no-underline
      "
    >
      Privacy Policy
    </button>

    <button
      type="button"
      onClick={() =>
        router.push("/business-dashboard/about/return-refund-policy")
      }
      className="
        text-blue-600
        hover:text-blue-700
        no-underline
      "
    >
      Business Policies
    </button>

    <button
      type="button"
      onClick={() =>
        router.push("/business-dashboard/about/business-terms-of-use")
      }
      className="
        text-blue-600
        hover:text-blue-700
        no-underline
      "
    >
      Terms-of-Use
    </button>

  </div>

</div>

          </div>

        </div>

      </div>
      <AlertBox
        open={alert.open}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={closeAlert}
      />

    </main>
  );
}