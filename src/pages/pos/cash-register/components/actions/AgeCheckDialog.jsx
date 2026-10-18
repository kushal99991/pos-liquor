import { useEffect, useState } from "react";
import { Dialog, DialogContent, Box, Button, IconButton, Backdrop, CircularProgress,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import { Close, CheckCircle, CameraAlt } from "@mui/icons-material";
import CameraModal from "./CameraModal";
import { useVerifyAgeMutation } from "services/ageCheckSlice";
import { useDispatch, useSelector } from "react-redux";
import { setAgeVerifiedCustomer } from "store/slice/cart.slice";
import moment from "moment";
import { appConfig } from "config/app.config";

const AgeCheckDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const customer = useSelector((state) => state.cart.customer);
  const [birthDate, setBirthDate] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [customerAge, setCustomerAge] = useState(null);
  const [verificationDate, setVerificationDate] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const [verifyAge] = useVerifyAgeMutation();

  useEffect(() => {
  if (open && customer?.isVerified) {
    setBirthDate(customer.birthDate || "");
    setCustomerAge(customer.age || null);
    setIsVerified(true);
    setVerificationDate(customer.birthDate || "");
    setVerificationError("");
  }
}, [open, customer]);


  const calculateBornOnDate = () => {
    const today = new Date();
    const year = today.getFullYear() - 21;
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${month}/${day}/${year}`;
  };

  const handleNumberClick = (num) => {
    setVerificationError("");
    const digitsOnly = birthDate.replace(/\//g, "");
    if (digitsOnly.length < 8) {
      const newDigits = digitsOnly + num;
      let formatted = "";
      for (let i = 0; i < newDigits.length; i++) {
        if (i === 2 || i === 4) formatted += "/";
        formatted += newDigits[i];
      }
      setBirthDate(formatted);
    }
  };

  const handleClear = () => {
    setBirthDate("");
    setIsVerified(false);
    setCustomerAge(null);
    setVerificationDate("");
    setVerificationError("");
    dispatch(
      setAgeVerifiedCustomer({
        age: '',
        birthDate: '',
        isVerified: false,
      })
    );
  };

  const handleBackspace = () => {
    setVerificationError("");
    const digitsOnly = birthDate.replace(/\//g, "");
    const newDigits = digitsOnly.slice(0, -1);
    let formatted = "";
    for (let i = 0; i < newDigits.length; i++) {
      if (i === 2 || i === 4) formatted += "/";
      formatted += newDigits[i];
    }
    setBirthDate(formatted);
    setIsVerified(false);
    setCustomerAge(null);
    setVerificationDate("");
  };

  const handleEnter = async () => {
    if (birthDate.length === 10) {
      const result = await verifyAgeFromDocument(null, moment(new Date(birthDate)).format(appConfig.dateApiFormat));
      if (result.isVerified) {
        setBirthDate(result.birthDate);
        setCustomerAge(result.age);
        setIsVerified(true);
        setVerificationDate(result.birthDate);
      } else {
        setBirthDate("");
        setCustomerAge("");
        setIsVerified(false);
        setVerificationDate("");
        setVerificationError(
          "Could not verify age from the document. Please try again or enter manually."
        );
      }
      // setCustomerAge(age);
      // setIsVerified(true);
      // setVerificationDate(birthDate);
    }
  };

  const handleContinue = () => {
    dispatch(
      setAgeVerifiedCustomer({
        age: customerAge,
        birthDate: birthDate,
        isVerified: isVerified,
      })
    );
    if (isVerified) {
      onClose();
    }
  };

  const handlePrintDisclaimer = () => {
    console.log("Print disclaimer");
  };

  const handleAddCustomer = () => {
    console.log("Add customer");
  };

  const handleScanLicense = () => {
    setCameraOpen(true);
    setVerificationError("");
  };

  function base64ToBlob(base64, mimeType = "image/jpeg") {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  }

  const handleCameraCapture = async (imageBlob) => {
    setIsLoading(true);
    setVerificationError("");
    try {
      const result = await verifyAgeFromDocument(imageBlob);
      if (result.isVerified) {
        setBirthDate(result.birthDate);
        setCustomerAge(result.age);
        setIsVerified(true);
        setVerificationDate(result.birthDate);
      } else {
        setBirthDate("");
        setCustomerAge("");
        setIsVerified(false);
        setVerificationDate("");
        setVerificationError(
          "Could not verify age from the document. Please try again or enter manually."
        );
      }
    } catch (error) {
      console.error("Error verifying age:", error);
      setVerificationError(
        "An error occurred during verification. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAgeFromDocument = async (base64Image, birthDate = null) => {
    const formData = new FormData();
    if (base64Image) {
      const imageBlob = base64ToBlob(base64Image);
      formData.append("file", imageBlob);
    }else{
      formData.append("dob", birthDate);
    }
    const response = await verifyAge(formData);

    if (response?.data?.verified) {
      const { dob, age } = response.data;
      const [year, month, day] = dob.split("-");
      const formattedDOB = `${month}/${day}/${year}`;

      return {
        isVerified: true,
        birthDate: formattedDOB,
        age,
      };
    }

    return {
      isVerified: false,
    };
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "white",
            borderRadius: 0,
            maxWidth: "1100px",
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box>
            <Box
              sx={{
                background: "linear-gradient(to right, #8b2e45, #a8415a)",
                color: "white",
                py: 1.75,
                px: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                Age Check
              </h2>
              <IconButton
                onClick={onClose}
                sx={{
                  position: "absolute",
                  right: 12,
                  color: "white",
                  backgroundColor: "#721f36",
                  width: "36px",
                  height: "36px",
                  "&:hover": { backgroundColor: "#5a1829" },
                }}
              >
                <Close sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            <Box sx={{ p: 2.5, backgroundColor: "#f5f5f5" }}>
              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.modal + 2,
                }}
                open={isLoading}
              >
                <CircularProgress color="inherit" />
              </Backdrop>

              {/* Error Box */}
              {verificationError && (
                <Box
                  sx={{
                    backgroundColor: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fca5a5",
                    borderRadius: "6px",
                    padding: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  {verificationError}
                </Box>
              )}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "58% 42%",
                  gap: 2.5,
                }}
              >
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      BORN ON/BEFORE :
                    </span>
                    <span
                      style={{
                        color: "#8b2e45",
                        fontWeight: 700,
                        fontSize: "16px",
                      }}
                    >
                      {calculateBornOnDate()}
                    </span>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#333",
                        }}
                      >
                        SCAN LICENSE
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#333",
                          marginLeft: "4px",
                        }}
                      >
                        :
                      </span>
                    </Box>
                    <Box sx={{ position: "relative" }}>
                      <KeyboardTextField
                        fullWidth
                        value=""
                        placeholder=""
                        disabled
                        sx={{
                          backgroundColor: "white",
                          "& .MuiOutlinedInput-root": {
                            height: "38px",
                            fontSize: "14px",
                            "& fieldset": {
                              borderColor: "#d1d5db",
                              borderWidth: 1,
                            },
                          },
                        }}
                      />
                      <IconButton
                        onClick={handleScanLicense}
                        sx={{
                          position: "absolute",
                          right: 2,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#8b2e45",
                          padding: "4px",
                          "&:hover": { backgroundColor: "#f3f4f6" },
                        }}
                      >
                        <CameraAlt sx={{ fontSize: 22 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#333",
                        }}
                      >
                        BIRTH DATE
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#333",
                          marginLeft: "4px",
                        }}
                      >
                        :
                      </span>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <KeyboardTextField
                        fullWidth
                        value={birthDate}
                        disabled
                        sx={{
                          backgroundColor: "white",
                          "& .MuiOutlinedInput-root": {
                            height: "38px",
                            fontSize: "14px",
                            "& fieldset": {
                              borderColor: "#d1d5db",
                              borderWidth: 1,
                            },
                          },
                        }}
                      />
                      <span
                        style={{
                          color: "#6b7280",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        MM/DD/YYYY
                      </span>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      borderTop: "2px solid #d1d5db",
                      pt: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "70px",
                          height: "70px",
                          backgroundColor: "#e5e7eb",
                          borderRadius: "50%",
                          flexShrink: 0,
                        }}
                      >
                        {isVerified && (
                          <CheckCircle
                            sx={{ fontSize: 45, color: "#16a34a" }}
                          />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#6b7280",
                            marginBottom: "2px",
                          }}
                        >
                          CUSTOMER'S AGE
                        </div>
                        <div
                          style={{
                            color: "#8b2e45",
                            fontWeight: 900,
                            fontSize: "60px",
                            lineHeight: 1,
                            fontFamily: "Arial, sans-serif",
                          }}
                        >
                          {customerAge !== null ? customerAge : "21"}
                        </div>
                      </Box>
                      {isVerified && (
                        <Box sx={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#16a34a",
                              marginBottom: "2px",
                            }}
                          >
                            AGE VERIFIED
                          </div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>
                            {verificationDate}
                          </div>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 1.25,
                    }}
                  >
                    <Button
                      fullWidth
                      onClick={handlePrintDisclaimer}
                      sx={{
                        backgroundColor: "#8b2e45",
                        color: "white",
                        py: 1.1,
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        borderRadius: "4px",
                        "&:hover": { backgroundColor: "#721f36" },
                      }}
                    >
                      PRINT DISCLAIMER
                    </Button>
                    <Button
                      fullWidth
                      onClick={handleAddCustomer}
                      sx={{
                        backgroundColor: "#8b2e45",
                        color: "white",
                        py: 1.1,
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        borderRadius: "4px",
                        "&:hover": { backgroundColor: "#721f36" },
                      }}
                    >
                      ADD CUSTOMER
                    </Button>
                    <Button
                      fullWidth
                      onClick={handleContinue}
                      disabled={!isVerified}
                      sx={{
                        backgroundColor: isVerified ? "#8b2e45" : "#d1d5db",
                        color: "white",
                        py: 1.1,
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        borderRadius: "4px",
                        "&:hover": {
                          backgroundColor: isVerified ? "#721f36" : "#d1d5db",
                        },
                        "&.Mui-disabled": {
                          color: "#9ca3af",
                        },
                      }}
                    >
                      CONTINUE
                    </Button>
                    <Button
                      fullWidth
                      onClick={handleClear}
                      sx={{
                        backgroundColor: "#8b2e45",
                        color: "white",
                        py: 1.1,
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        borderRadius: "4px",
                        "&:hover": { backgroundColor: "#721f36" },
                      }}
                    >
                      CLEAR
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(to bottom, #4b5563, #374151)",
                      borderRadius: "12px",
                      p: 2,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 1.25,
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <Button
                          key={num}
                          onClick={() => handleNumberClick(num.toString())}
                          sx={{
                            backgroundColor: "white",
                            color: "#8b2e45",
                            fontSize: "28px",
                            fontWeight: 700,
                            minHeight: "65px",
                            borderRadius: "10px",
                            border: "none",
                            "&:hover": {
                              backgroundColor: "#f9fafb",
                              transform: "scale(0.98)",
                            },
                            transition: "all 0.1s",
                          }}
                        >
                          {num}
                        </Button>
                      ))}
                      <Button
                        onClick={handleBackspace}
                        sx={{
                          backgroundColor: "white",
                          color: "#8b2e45",
                          fontSize: "24px",
                          fontWeight: 700,
                          minHeight: "65px",
                          borderRadius: "10px",
                          border: "none",
                          "&:hover": {
                            backgroundColor: "#f9fafb",
                            transform: "scale(0.98)",
                          },
                          transition: "all 0.1s",
                        }}
                      >
                        <Close sx={{ fontSize: 28 }} />
                      </Button>
                      <Button
                        onClick={() => handleNumberClick("0")}
                        sx={{
                          backgroundColor: "white",
                          color: "#8b2e45",
                          fontSize: "28px",
                          fontWeight: 700,
                          minHeight: "65px",
                          borderRadius: "10px",
                          border: "none",
                          "&:hover": {
                            backgroundColor: "#f9fafb",
                            transform: "scale(0.98)",
                          },
                          transition: "all 0.1s",
                        }}
                      >
                        0
                      </Button>
                      <Button
                        onClick={handleEnter}
                        sx={{
                          backgroundColor: "#8b2e45",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: 700,
                          minHeight: "65px",
                          borderRadius: "10px",
                          textTransform: "uppercase",
                          "&:hover": {
                            backgroundColor: "#721f36",
                            transform: "scale(0.98)",
                          },
                          transition: "all 0.1s",
                        }}
                      >
                        ENTER
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
};

export default AgeCheckDialog;
