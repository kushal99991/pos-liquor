import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import Cropper from "react-easy-crop";

/** Utility: Crop base64 image using crop area pixels */
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await image.decode();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg");
};

const CameraModalWithCrop = ({
  open,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  /** Start Camera */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStarted(true);
      }
    } catch (err) {
      console.error("Error starting camera:", err);
      alert("Unable to access the camera.");
      onClose();
    }
  };

  /** Stop Camera */
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraStarted(false);
    }
  };

  /** Capture Image */
  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(dataUrl);
    setCropOpen(true);
    stopCamera();
  };

  /** Handle Crop */
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSaveCrop = useCallback(async () => {
    if (!capturedImage || !croppedAreaPixels) return;
    const cropped = await getCroppedImg(capturedImage, croppedAreaPixels);
    onCapture(cropped);
    setCropOpen(false);
    onClose();
  }, [capturedImage, croppedAreaPixels, onCapture, onClose]);

  useEffect(() => {
    if (open) startCamera();
    else stopCamera();

    return () => stopCamera();
  }, [open]);

  return (
    <>
      {/* Main Camera Dialog */}
      <Dialog
        open={open}
        onClose={() => {
          stopCamera();
          onClose();
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { backgroundColor: "#000", borderRadius: "12px", overflow: "hidden" },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={captureImage}
            disabled={!cameraStarted}
          >
            Capture
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              stopCamera();
              onClose();
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Crop Dialog */}
      <Dialog open={cropOpen} fullWidth maxWidth="sm">
        <DialogContent
          sx={{
            position: "relative",
            height: 400,
            background: "#000",
            p: 0,
          }}
        >
          {capturedImage && (
            <Cropper
              image={capturedImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={() => setCropOpen(false)} color="inherit">
            Retake
          </Button>
          <Button variant="contained" onClick={handleSaveCrop}>
            Save Crop
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CameraModalWithCrop;
