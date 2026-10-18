import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, IconButton, Typography, Alert, Snackbar } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import CloseIcon from '@mui/icons-material/Close';
import { useLazyGetDrawerBalanceQuery, useCreateDrawerTransactionMutation, useLazyGetOpenDrawerQuery } from 'services/cashierDrawerSlice';
import useSnackbar from 'hooks/useSnackbar';

const DrawerDialog = ({ open, onClose }) => {
  const { openSnackbar } = useSnackbar();
  const [getDrawerBalance, { isLoading }] = useLazyGetDrawerBalanceQuery();
  const [getOpenDrawer] = useLazyGetOpenDrawerQuery();
  const [createDrawerTransaction] = useCreateDrawerTransactionMutation();
  const [drawerBalanceData, setDrawerBalanceData] = useState(null);
  const [drawer_id, setDrawerId] = useState(null);
  const [amount, setAmount] = useState('0.00');
  const [activeAction, setActiveAction] = useState('DROP');
  const [description, setDescription] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleNumberClick = (num) => {
    if (amount === '0.00') {
      setAmount(num === '00' ? '0.00' : `0.0${num}`);
    } else {
      const cleaned = amount.replace('.', '');
      const newAmount = cleaned + num;
      const formatted = (parseInt(newAmount) / 100).toFixed(2);
      setAmount(formatted);
    }
  };

  const handleDecimalClick = () => {
    // Decimal is already handled in the formatting
  };

  const handleClear = () => {
    setAmount('0.00');
  };

  const handleDelete = () => {
    const cleaned = amount.replace('.', '');
    if (cleaned.length <= 1) {
      setAmount('0.00');
    } else {
      const newAmount = cleaned.slice(0, -1);
      const formatted = (parseInt(newAmount) / 100).toFixed(2);
      setAmount(formatted);
    }
  };

  const getTransactionType = (action) => {
    const actionMap = {
      'PAY OUT': 'pay_out',
      'PAY IN': 'pay_in',
      'DROP': 'drop',
    };
    return actionMap[action] || 'pay_in';
  };

  const handleEnter = async () => {
    if (!activeAction || parseFloat(amount) <= 0 || !drawer_id) {
      return;
    }

    const transactionType = getTransactionType(activeAction);
    const payload = {
      drawer_id: drawer_id,
      transaction_type: transactionType,
      amount: parseFloat(amount),
      note: description.trim() || (activeAction === 'PAY OUT' && performedBy ? `Paid to ${performedBy}` : ''),
    };

    const response = await createDrawerTransaction(payload);
    
    if (response?.error) {
      openSnackbar(response.error, "error");
      return false;
    }

    let message = '';
    if (activeAction === 'DROP') {
      message = `Successfully removed $${amount} from drawer (Overflow removal)`;
    } else if (activeAction === 'PAY OUT') {
      message = `Successfully paid out $${amount}${performedBy ? ` to ${performedBy}` : ''}`;
    } else if (activeAction === 'PAY IN') {
      message = `Successfully added $${amount} to drawer`;
    }

    // Refresh balance after successful transaction
    if (response?.data && drawer_id) {
      await fetchDrawerBalance(drawer_id);
    }

    setSuccessMessage(message);
    setShowSuccess(true);

    handleClear();
    setDescription('');
    setPerformedBy('');
  };

  const handleActionClick = (action) => {
    setActiveAction(action);
  };

  const fetchOpenDrawer = async () => {
    const response = await getOpenDrawer();
    if (response?.error) {
      openSnackbar(response.error, "error");
      return false;
    }
    if (response?.data?.id) {
      setDrawerId(response.data.id);
      return response.data.id;
    }
    return null;
  };

  const fetchDrawerBalance = async (drawerId) => {
    if (!drawerId) return;
    const response = await getDrawerBalance(drawerId);
    if (response?.error) {
      openSnackbar(response.error, "error");
      return false;
    }
    setDrawerBalanceData(response?.data ?? null);
  };

  useEffect(() => {
    if (open) {
      const initializeDrawer = async () => {
        const drawerId = await fetchOpenDrawer();
        if (drawerId) {
          await fetchDrawerBalance(drawerId);
        }
      };
      initializeDrawer();
    }
  }, [open]);

  const getCurrentBalance = () => {
    if (drawerBalanceData?.total_balance !== undefined) {
      return parseFloat(drawerBalanceData.total_balance).toFixed(2);
    }
    return parseFloat(localStorage.getItem('cashDrawerBalance') || '0').toFixed(2);
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#f5f5f5',
          borderRadius: '8px',
        }
      }}
    >
      <DialogTitle sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
        px: 2
      }}>
        <span className="text-lg font-semibold" style={{ color: '#8B0000' }}>
          PAYIN/OUT
        </span>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: '#8B0000',
            color: 'white',
            '&:hover': {
              bgcolor: '#6B0000',
            },
            width: 32,
            height: 32
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Box className="mb-3 p-3 bg-white rounded-lg shadow">
          <Typography variant="body2" className="text-gray-600 mb-1">
            Current Drawer Balance
          </Typography>
          <Typography variant="h5" className="font-bold" style={{ color: '#8B0000' }}>
            ${getCurrentBalance()}
          </Typography>
        </Box>

        <Box className="flex gap-3 mb-4">
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleActionClick('DROP')}
            sx={{
              bgcolor: activeAction === 'DROP' ? '#8B1538' : 'white',
              color: activeAction === 'DROP' ? 'white' : '#333',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#8B1538',
              },
              boxShadow: 2
            }}
          >
            DROP
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleActionClick('PAY OUT')}
            sx={{
              bgcolor: activeAction === 'PAY OUT' ? '#8B1538' : 'white',
              color: activeAction === 'PAY OUT' ? 'white' : '#333',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#e0e0e0',
              },
              boxShadow: 1
            }}
          >
            PAY OUT
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleActionClick('PAY IN')}
            sx={{
              bgcolor: activeAction === 'PAY IN' ? '#8B1538' : 'white',
              color: activeAction === 'PAY IN' ? 'white' : '#333',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#e0e0e0',
              },
              boxShadow: 1
            }}
          >
            PAY IN
          </Button>
        </Box>

        {activeAction && (
          <Box className="mb-4 p-3 bg-white rounded-lg shadow">
            <Typography variant="body2" className="font-semibold mb-2" style={{ color: '#8B0000' }}>
              {activeAction === 'DROP' && 'Remove overflow cash from drawer'}
              {activeAction === 'PAY OUT' && 'Make payment to employee or distributor'}
              {activeAction === 'PAY IN' && 'Add more cash to drawer'}
            </Typography>

            {activeAction === 'PAY OUT' && (
              <KeyboardTextField
                fullWidth
                size="small"
                placeholder="Recipient name (optional)"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                sx={{ mb: 1 }}
              />
            )}

            <KeyboardTextField
              fullWidth
              size="small"
              placeholder="Add note or reason (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
            />
          </Box>
        )}

        <Box
          className="mx-auto"
          sx={{
            bgcolor: '#424242',
            borderRadius: '12px',
            p: 3,
            maxWidth: '380px',
            boxShadow: 4
          }}
        >
          <Box
            sx={{
              bgcolor: '#424242',
              color: 'white',
              textAlign: 'right',
              py: 2,
              px: 3,
              mb: 2,
              borderRadius: '8px',
              border: '2px solid #525252',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
          >
            <span className="text-4xl font-semibold">
              $ {amount}
            </span>
          </Box>

          <Box className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'].map((num) => (
              <Button
                key={num}
                onClick={() => num === '.' ? handleDecimalClick() : handleNumberClick(num)}
                sx={{
                  bgcolor: 'white',
                  color: '#8B0000',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  py: 2,
                  borderRadius: '8px',
                  minHeight: '60px',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  },
                  boxShadow: 2
                }}
              >
                {num}
              </Button>
            ))}
          </Box>

          <Box className="grid grid-cols-3 gap-2 mt-2">
            <Button
              onClick={handleDelete}
              sx={{
                bgcolor: '#8B1538',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 600,
                py: 2,
                borderRadius: '8px',
                minHeight: '60px',
                '&:hover': {
                  bgcolor: '#6B0000',
                },
                boxShadow: 2
              }}
            >
              ×
            </Button>
            <Button
              onClick={handleClear}
              sx={{
                bgcolor: '#8B1538',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                py: 2,
                borderRadius: '8px',
                minHeight: '60px',
                '&:hover': {
                  bgcolor: '#6B0000',
                },
                boxShadow: 2
              }}
            >
              CLEAR
            </Button>
            <Button
              onClick={handleEnter}
              disabled={!activeAction || parseFloat(amount) <= 0}
              sx={{
                bgcolor: '#8B1538',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                py: 2,
                borderRadius: '8px',
                minHeight: '60px',
                '&:hover': {
                  bgcolor: '#6B0000',
                },
                '&:disabled': {
                  bgcolor: '#666',
                  color: '#999',
                },
                boxShadow: 2
              }}
            >
              ENTER
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>

    <Snackbar
      open={showSuccess}
      autoHideDuration={3000}
      onClose={() => setShowSuccess(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setShowSuccess(false)}
        severity="success"
        sx={{ width: '100%' }}
      >
        {successMessage}
      </Alert>
    </Snackbar>
    </>
  );
};

export default DrawerDialog;
