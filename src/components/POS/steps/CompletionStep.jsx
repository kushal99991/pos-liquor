import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, Store, CreditCard, Settings, ArrowRight, Download } from 'lucide-react';
import { Box, Typography, Grid, Paper, Stack, Button, Link } from '@mui/material';
import { completeInstallation } from 'store/slice/pos.slice';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

const CompletionStep = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { installation } = useSelector((state) => state.pos);

  useEffect(() => {
    dispatch(completeInstallation());
  }, [dispatch]);

  const generatePDFReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('POS Configuration Report', 105, 20, { align: 'center' });

    // Store Configuration
    doc.setFontSize(14);
    doc.text('1. Store Configuration', 20, 40);
    doc.setFontSize(12);
    doc.text(`Name: ${installation.storeConfig.name}`, 25, 50);
    doc.text(`Currency: ${installation.storeConfig.currency}`, 25, 60);
    doc.text(`Tax Rate: ${installation.storeConfig.taxRate}%`, 25, 70);

    // Payment Methods
    doc.setFontSize(14);
    doc.text('2. Payment Methods', 20, 90);
    doc.setFontSize(12);
    if (installation.paymentConfig.cashEnabled) doc.text('✓ Cash payments', 25, 100);
    if (installation.paymentConfig.creditCardEnabled) doc.text('✓ Credit cards', 25, 110);
    if (installation.paymentConfig.digitalWalletEnabled) doc.text('✓ Digital wallets', 25, 120);
    if (installation.paymentConfig.stripeEnabled) doc.text('✓ Stripe integration', 25, 130);

    // Connected Devices
    doc.setFontSize(14);
    doc.text('3. Connected Devices', 20, 150);
    doc.setFontSize(12);
    doc.text(`Total Devices: ${installation.devices.length}`, 25, 160);
    installation.devices.forEach((device, index) => {
      doc.text(`✓ ${device.name}`, 25, 170 + index * 10);
    });

    // Save PDF
    doc.save(`pos-config-${new Date().getTime()}.pdf`);
  };

  const getNextSteps = () => [
    {
      title: 'Add Your Products',
      description: 'Start building your product catalog',
      icon: Store,
      action: () => navigate('/inventory')
    },
    {
      title: 'Test a Transaction',
      description: 'Process your first sale',
      icon: CreditCard,
      action: () => navigate('/pos-terminal')
    },
    {
      title: 'Configure Advanced Settings',
      description: 'Customize reports, taxes, and more',
      icon: Settings,
      action: () => navigate('/settings')
    }
  ];


  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box textAlign="center">
        <Box
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'success.light',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}
        >
          <CheckCircle size={40} color="#2e7d32" />
        </Box>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          Installation Complete!
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={500} mx="auto">
          Congratulations! Your POS system has been successfully configured and is ready to use. 
          All your devices are connected and payment methods are set up.
        </Typography>
      </Box>

      {/* Installation Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 8,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'success.light',
          background: 'linear-gradient(to bottom right, #ECFDF5, #EFF6FF)'
        }}
      >
        <Typography variant="h6" fontWeight="semibold" textAlign="center" mb={6}>
          Installation Summary
        </Typography>

        <Grid container spacing={6}>
          {/* Store Info */}
          <Grid item xs={12} md={4} textAlign="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: '#DBEAFE',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1
              }}
            >
              <Store size={24} color="#2563EB" />
            </Box>
            <Typography fontWeight="medium" mb={1}>Store Configuration</Typography>
            <Stack spacing={0.5} textAlign="center" color="text.secondary" fontSize="0.875rem">
              <Typography fontWeight="medium">{installation.storeConfig.name}</Typography>
              <Typography>{installation.storeConfig.currency}</Typography>
              <Typography>{installation.storeConfig.taxRate}% tax</Typography>
            </Stack>
          </Grid>

          {/* Payment Methods */}
          <Grid item xs={12} md={4} textAlign="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: '#D1FAE5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1
              }}
            >
              <CreditCard size={24} color="#16A34A" />
            </Box>
            <Typography fontWeight="medium" mb={1}>Payment Methods</Typography>
            <Stack spacing={0.5} textAlign="center" color="text.secondary" fontSize="0.875rem">
              {installation.paymentConfig.cashEnabled && <Typography>✓ Cash payments</Typography>}
              {installation.paymentConfig.creditCardEnabled && <Typography>✓ Credit cards</Typography>}
              {installation.paymentConfig.digitalWalletEnabled && <Typography>✓ Digital wallets</Typography>}
              {installation.paymentConfig.stripeEnabled && <Typography>✓ Stripe integration</Typography>}
            </Stack>
          </Grid>

          {/* Devices */}
          <Grid item xs={12} md={4} textAlign="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: '#EDE9FE',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1
              }}
            >
              <Settings size={24} color="#7C3AED" />
            </Box>
            <Typography fontWeight="medium" mb={1}>Connected Devices</Typography>
            <Stack spacing={0.5} textAlign="center" color="text.secondary" fontSize="0.875rem">
              <Typography>{installation.devices.length} device(s) connected</Typography>
              {installation.devices.map((device) => (
                <Typography key={device.id} noWrap>✓ {device.name}</Typography>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Next Steps */}
      <Paper elevation={0} sx={{ p: 6, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="semibold" mb={4}>What's Next?</Typography>

        <Grid container spacing={4}>
          {getNextSteps().map((step, index) => {
            const Icon = step.icon;
            return (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: '0.3s',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={step.action} // redirect on click
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: '#F3F4F6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <Icon size={20} color="#4B5563" />
                  </Box>
                  <Typography fontWeight="medium" mb={1}>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>{step.description}</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} color="#2563EB" fontWeight="medium">
                    <Typography fontSize="0.875rem">{step.action.name}</Typography>
                    <ArrowRight size={14} color="#2563EB" />
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center">
        <Button
          variant="outlined"
          startIcon={<Download size={20} />}
          onClick={generatePDFReport}
        >
          Download Configuration
        </Button>
        <Button variant="contained" color="primary" endIcon={<ArrowRight size={20} />} onClick={()=> navigate('/home')}>
          Start Using POS System
        </Button>
      </Stack>

      {/* Support Info */}
      <Paper elevation={0} sx={{ p: 6, borderRadius: 2, textAlign: 'center', bgcolor: '#F9FAFB' }}>
        <Typography fontWeight="medium" mb={2}>Need Help?</Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Our support team is here to help you get the most out of your POS system.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center" fontSize="0.875rem">
          <Link href="#" color="primary" underline="hover">📚 View Documentation</Link>
          <Link href="#" color="primary" underline="hover">💬 Contact Support</Link>
          <Link href="#" color="primary" underline="hover">🎥 Watch Tutorials</Link>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default CompletionStep;
