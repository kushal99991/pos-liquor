import { useState, useEffect } from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import { Box, Typography, Switch, FormControlLabel, Paper, Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setPaymentConfiguration } from 'store/slice/pos.slice';

const PaymentSetupStep = () => {
  const dispatch = useDispatch();
  const { paymentConfig } = useSelector((state) => state.pos.installation);

  const [formData, setFormData] = useState(paymentConfig);

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    dispatch(setPaymentConfiguration(formData));
  }, [formData, dispatch]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, px: 2 }}>
      <Box textAlign="center" mb={4}>
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'success.light',
            borderRadius: '50%',
          }}
        >
          <CreditCard size={32} className="text-green-600" />
        </Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Payment Setup
        </Typography>
        <Typography color="text.secondary">
          Configure your payment methods and processing options
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <DollarSign size={32} className="text-green-500" />
              <Box>
                <Typography variant="h6">Cash Payments</Typography>
                <Typography variant="body2" color="text.secondary">
                  Accept cash transactions
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.cashEnabled}
                  onChange={() => handleToggle('cashEnabled')}
                />
              }
              label=""
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <CreditCard size={32} className="text-blue-500" />
              <Box>
                <Typography variant="h6">Credit Card Payments</Typography>
                <Typography variant="body2" color="text.secondary">
                  Accept credit and debit cards (Coming Soon)
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.creditCardEnabled}
                  disabled={true}
                  onChange={() => handleToggle('creditCardEnabled')}
                />
              }
              label=""
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentSetupStep;
