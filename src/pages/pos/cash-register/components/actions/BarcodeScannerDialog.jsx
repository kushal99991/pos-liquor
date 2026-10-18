import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { X, Camera, Keyboard } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function BarcodeScannerDialog({
  open,
  onClose,
  onScan,
}) {
  const [scanMode, setScanMode] = useState('camera');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    if (open && scanMode === 'camera') {
      startCameraScanning();
    }

    return () => {
      stopCameraScanning();
    };
  }, [open, scanMode]);

  const startCameraScanning = async () => {
    try {
      setError('');
      setScanning(true);

      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        setError('No camera found on this device');
        setScanning(false);
        return;
      }

      const selectedDeviceId = videoInputDevices[0].deviceId;

      if (videoRef.current) {
        codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              const code = result.getText();
              onScan(code);
              stopCameraScanning();
              onClose();
            }
            if (err && !(err.name === 'NotFoundException')) {
              console.error('Scanning error:', err);
            }
          }
        );
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopCameraScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      onClose();
    }
  };

  const handleClose = () => {
    stopCameraScanning();
    setManualInput('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          backgroundColor: 'white',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#9b2c2c',
          color: 'white',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          Scan Barcode
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          size="small"
        >
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '24px' }}>
        <Box sx={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <Button
            variant={scanMode === 'camera' ? 'contained' : 'outlined'}
            startIcon={<Camera size={20} />}
            onClick={() => setScanMode('camera')}
            sx={{
              flex: 1,
              backgroundColor: scanMode === 'camera' ? '#9b2c2c' : 'transparent',
              color: scanMode === 'camera' ? 'white' : '#9b2c2c',
              borderColor: '#9b2c2c',
              '&:hover': {
                backgroundColor: scanMode === 'camera' ? '#7f1d1d' : 'rgba(155, 44, 44, 0.04)',
                borderColor: '#9b2c2c',
              },
            }}
          >
            Camera Scan
          </Button>
          <Button
            variant={scanMode === 'manual' ? 'contained' : 'outlined'}
            startIcon={<Keyboard size={20} />}
            onClick={() => {
              stopCameraScanning();
              setScanMode('manual');
            }}
            sx={{
              flex: 1,
              backgroundColor: scanMode === 'manual' ? '#9b2c2c' : 'transparent',
              color: scanMode === 'manual' ? 'white' : '#9b2c2c',
              borderColor: '#9b2c2c',
              '&:hover': {
                backgroundColor: scanMode === 'manual' ? '#7f1d1d' : 'rgba(155, 44, 44, 0.04)',
                borderColor: '#9b2c2c',
              },
            }}
          >
            Manual Entry
          </Button>
        </Box>

        {scanMode === 'camera' && (
          <Box>
            {error ? (
              <Box
                sx={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                }}
              >
                <Typography sx={{ color: '#991b1b', marginBottom: '12px' }}>
                  {error}
                </Typography>
                <Button
                  variant="contained"
                  onClick={startCameraScanning}
                  sx={{
                    backgroundColor: '#9b2c2c',
                    '&:hover': {
                      backgroundColor: '#7f1d1d',
                    },
                  }}
                >
                  Retry
                </Button>
              </Box>
            ) : (
              <Box>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px',
                    backgroundColor: '#000',
                  }}
                />
                <Typography
                  sx={{
                    marginTop: '16px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  {scanning
                    ? 'Position the barcode within the camera view'
                    : 'Initializing camera...'}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {scanMode === 'manual' && (
          <Box>
            <Typography
              sx={{
                marginBottom: '12px',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Enter or scan barcode with handheld scanner:
            </Typography>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualSubmit();
                }
              }}
              placeholder="Type or scan barcode here..."
              autoFocus
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#9b2c2c] focus:outline-none text-lg font-mono"
            />
            <Typography
              sx={{
                marginTop: '12px',
                color: '#6b7280',
                fontSize: '13px',
              }}
            >
              💡 Tip: Focus this field and use your handheld barcode scanner. The barcode will
              be entered automatically.
            </Typography>
            <Button
              variant="contained"
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              sx={{
                marginTop: '20px',
                width: '100%',
                backgroundColor: '#9b2c2c',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#7f1d1d',
                },
                '&:disabled': {
                  backgroundColor: '#d1d5db',
                },
              }}
            >
              Submit Barcode
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
