// steps/StoreInfoStep.tsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Store } from 'lucide-react';
import { Box, MenuItem, Typography, Paper, Grid } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import { setStoreConfiguration } from 'store/slice/pos.slice';

const StoreInfoStep = ({ onValidityChange }) => {
  const dispatch = useDispatch();
  const { storeConfig } = useSelector((state) => state.pos.installation);

  const [formData, setFormData] = useState(storeConfig);
  const [errors, setErrors] = useState({});

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' }
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const validateForm = (data = formData) => {
    const newErrors = {};

    if (!data.name?.trim()) newErrors.name = 'Store name is required';
    if (!data.address?.trim()) newErrors.address = 'Address is required';
    if (!data.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (data.taxRate < 0 || data.taxRate > 100) {
      newErrors.taxRate = 'Tax rate must be between 0 and 100';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidityChange?.(isValid); // ✅ notify parent about validity
    return isValid;
  };

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    validateForm(newData);
  };

  useEffect(() => {
    dispatch(setStoreConfiguration(formData));
    validateForm(formData);
  }, [formData]);

  return (
    <Box className="space-y-8">
      <Box className="text-center">
        <Box className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store size={32} className="text-blue-600" />
        </Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Store Information
        </Typography>
        <Typography color="text.secondary">
          Tell us about your store to personalize your POS system
        </Typography>
      </Box>

      {/* Form Fields */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <KeyboardTextField
            fullWidth
            label="Store Name *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>

        <Grid item xs={12}>
          <KeyboardTextField
            fullWidth
            label="Address *"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            multiline
            rows={3}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <KeyboardTextField
            fullWidth
            label="Phone Number *"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <KeyboardTextField
            fullWidth
            label="Email Address *"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <KeyboardTextField
            fullWidth
            label="Tax Rate (%)"
            type="number"
            value={formData.taxRate}
            onChange={(e) =>
              handleInputChange('taxRate', parseFloat(e.target.value) || 0)
            }
            error={!!errors.taxRate}
            helperText={errors.taxRate}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <KeyboardTextField
            fullWidth
            select
            label="Currency"
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
          >
            {currencies.map((currency) => (
              <MenuItem key={currency.value} value={currency.value}>
                {currency.label}
              </MenuItem>
            ))}
          </KeyboardTextField>
        </Grid>

        <Grid item xs={12}>
          <KeyboardTextField
            fullWidth
            select
            label="Timezone"
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
          >
            {timezones.map((tz) => (
              <MenuItem key={tz} value={tz}>
                {tz.replace('_', ' ')}
              </MenuItem>
            ))}
          </KeyboardTextField>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StoreInfoStep;
