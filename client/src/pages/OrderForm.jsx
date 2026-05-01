import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function OrderForm() {
  const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;
  const COUNTRY_OPTIONS = [
    { code: "IN", label: "India", dialCode: "+91", minDigits: 10, maxDigits: 10 },
    { code: "US", label: "United States", dialCode: "+1", minDigits: 10, maxDigits: 10 },
    { code: "GB", label: "United Kingdom", dialCode: "+44", minDigits: 10, maxDigits: 10 },
    { code: "AE", label: "UAE", dialCode: "+971", minDigits: 8, maxDigits: 9 },
    { code: "AU", label: "Australia", dialCode: "+61", minDigits: 9, maxDigits: 9 },
    { code: "OTHER", label: "Other Country", dialCode: "+", minDigits: 7, maxDigits: 15 },
  ];
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("IN");
  const [phone, setPhone] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [customDesign, setCustomDesign] = useState("");
  const [designFileName, setDesignFileName] = useState("");
  const [designFileData, setDesignFileData] = useState("");
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const q = parseFloat(quantity) || 0;
    const rate = 0.02;

    setPrice(Number((l * w * h * q * rate).toFixed(2)));
  }, [length, width, height, quantity]);
  const selectedCountry =
    COUNTRY_OPTIONS.find((country) => country.code === selectedCountryCode) || COUNTRY_OPTIONS[0];

  const handlePhoneChange = (event) => {
    const nextValue = event.target.value.replace(/\D/g, "");

    if (nextValue.length <= selectedCountry.maxDigits) {
      setPhone(nextValue);
    }
  };

  const handleDecimalInputChange = (setter) => (event) => {
    const nextValue = event.target.value;

    if (/^\d*\.?\d*$/.test(nextValue)) {
      setter(nextValue);
    }
  };

  const handleQuantityChange = (event) => {
    const nextValue = event.target.value;

    if (/^\d*$/.test(nextValue)) {
      setQuantity(nextValue);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setDesignFileName("");
      setDesignFileData("");
      return;
    }

    if (!file.type.includes("pdf") && !file.type.includes("zip") && !file.name.endsWith(".zip")) {
      setMessage("Please upload only PDF or ZIP file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setMessage("File size must be 5 MB or smaller.");
      setDesignFileName("");
      setDesignFileData("");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDesignFileName(file.name);
      setDesignFileData(reader.result);
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const parsedLength = Number(length);
    const parsedWidth = Number(width);
    const parsedHeight = Number(height);
    const parsedQuantity = Number(quantity);
    const fullPhoneNumber = `${selectedCountry.dialCode}${trimmedPhone}`;

    if (!trimmedName || !trimmedPhone || !length || !width || !height || !quantity) {
      setMessage("Please fill all custom box details.");
      return;
    }

    if (
      trimmedPhone.length < selectedCountry.minDigits ||
      trimmedPhone.length > selectedCountry.maxDigits
    ) {
      setMessage(
        selectedCountry.code === "IN"
          ? "For India, please enter exactly 10 mobile digits."
          : `Please enter a valid mobile number with ${selectedCountry.minDigits} to ${selectedCountry.maxDigits} digits.`
      );
      return;
    }

    if ([parsedLength, parsedWidth, parsedHeight].some((value) => Number.isNaN(value) || value <= 0)) {
      setMessage("Box length, width, and height must be valid numbers greater than 0.");
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setMessage("Quantity must be a whole number greater than 0.");
      return;
    }

    try {
      await api.post("/orders", {
        order_type: "custom",
        customer_name: trimmedName,
        customer_phone: fullPhoneNumber,
        box_length: parsedLength,
        box_width: parsedWidth,
        box_height: parsedHeight,
        quantity: parsedQuantity,
        total_price: price,
        custom_design: customDesign,
        design_file_name: designFileName,
        design_file_data: designFileData,
        note,
      });

      navigate("/customer");
    } catch (error) {
      console.log(error);
      setMessage(
        error.response?.data?.message || "Unable to submit custom order."
      );
    }
  };

  return (
    <div className="brand-page">
      <Navbar />

      <section className="brand-container py-8 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="brand-panel p-8 md:p-10">
            <p className="brand-kicker">Custom Manufacturing</p>
            <h1 className="mt-3 text-4xl font-black">Build your box specification.</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Share box size, quantity, design notes, and PDF artwork. We will review the request and confirm production through your order dashboard.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[24px] bg-[var(--brand-surface-strong)] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
                  Estimated Price
                </p>
                <p className="mt-2 text-4xl font-black">Rs. {price}</p>
              </div>
              <div className="rounded-[24px] bg-white p-5 text-sm leading-7 text-slate-600">
                Upload PDF or ZIP only. Maximum file size: 5 MB. Include print design, dieline, or special branding instructions if available.
              </div>
            </div>
          </div>

          <div className="brand-panel p-8 md:p-10">
            <h2 className="text-3xl font-black">Custom Box Order</h2>

            {message && (
              <div className="mt-5 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">
                {message}
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="brand-label">Customer Name</label>
                <input
                  className="brand-input"
                  placeholder="Customer Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="brand-label">Phone Number</label>
                <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)]">
                  <select
                    className="brand-input"
                    value={selectedCountryCode}
                    onChange={(e) => {
                      setSelectedCountryCode(e.target.value);
                      setPhone("");
                    }}
                  >
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label} ({country.dialCode})
                      </option>
                    ))}
                  </select>
                  <input
                    className="brand-input"
                    placeholder={
                      selectedCountry.code === "IN"
                        ? "Enter 10 digit mobile number"
                        : "Enter mobile number"
                    }
                    value={phone}
                    onChange={handlePhoneChange}
                    inputMode="numeric"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {selectedCountry.code === "IN"
                    ? "India mobile number must be exactly 10 digits."
                    : `This country accepts ${selectedCountry.minDigits} to ${selectedCountry.maxDigits} digits.`}
                </p>
              </div>

              <div>
                <label className="brand-label">Box Length</label>
                <input
                  className="brand-input"
                  placeholder="Box Length (inch)"
                  value={length}
                  onChange={handleDecimalInputChange(setLength)}
                  inputMode="decimal"
                />
              </div>

              <div>
                <label className="brand-label">Box Width</label>
                <input
                  className="brand-input"
                  placeholder="Box Width (inch)"
                  value={width}
                  onChange={handleDecimalInputChange(setWidth)}
                  inputMode="decimal"
                />
              </div>

              <div>
                <label className="brand-label">Box Height</label>
                <input
                  className="brand-input"
                  placeholder="Box Height (inch)"
                  value={height}
                  onChange={handleDecimalInputChange(setHeight)}
                  inputMode="decimal"
                />
              </div>

              <div>
                <label className="brand-label">Quantity</label>
                <input
                  className="brand-input"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputMode="numeric"
                />
              </div>

              <div className="md:col-span-2">
                <label className="brand-label">Custom Design Details</label>
                <textarea
                  className="brand-input min-h-[120px]"
                  placeholder="Custom Design Details"
                  value={customDesign}
                  onChange={(e) => setCustomDesign(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="brand-label">Design PDF / ZIP</label>
                <input
                  type="file"
                  accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
                  className="brand-input"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {designFileName && (
              <p className="mt-4 text-sm font-semibold text-green-700">
                Selected File: {designFileName}
              </p>
            )}

            <div className="mt-4">
              <label className="brand-label">Special Instructions</label>
              <textarea
                className="brand-input min-h-[120px]"
                placeholder="Special Instructions"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button className="brand-button mt-6 w-full" onClick={handleSubmit}>
              Submit Order
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OrderForm;
