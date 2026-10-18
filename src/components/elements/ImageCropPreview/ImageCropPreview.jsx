import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";

const ImageCropPreview = ({ imageSrc, onSave, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImage = useCallback(async () => {
    const image = new Image();
    image.src = imageSrc;
    await image.decode();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const { width, height, x, y } = croppedAreaPixels;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    const croppedDataUrl = canvas.toDataURL("image/jpeg");
    onSave(croppedDataUrl);
  }, [croppedAreaPixels, imageSrc, onSave]);

  return (
    <Dialog open fullWidth maxWidth="sm">
      <DialogContent sx={{ position: "relative", height: 400, background: "#000" }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={getCroppedImage} variant="contained">Save Crop</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropPreview;
