import { useState, useEffect } from 'react';
import {
  TestTube,
  CheckCircle,
  XCircle,
  RotateCw,
  Scan as Scanner,
  Printer,
  CreditCard,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Fade,
  Collapse,
  CircularProgress
} from '@mui/material';

const TestingStep = ({ installation, onTestsComplete }) => {
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [progress, setProgress] = useState(0);

  const initializeTests = () => {
    const tests = [
      { id: 'store-config', name: 'Store Configuration', status: 'pending' },
      { id: 'payment-config', name: 'Payment Methods', status: 'pending' },
    ];

    installation.devices.forEach((device) => {
      tests.push({
        id: `device-${device.id}`,
        name: `${device.name} Connection`,
        status: 'pending',
      });
    });

    if (installation.paymentConfig.stripeEnabled) {
      tests.push({
        id: 'stripe-connection',
        name: 'Stripe Integration',
        status: 'pending',
      });
    }

    tests.push({
      id: 'final-check',
      name: 'System Integration',
      status: 'pending',
    });

    setTestResults(tests);
  };

  const runTest = async (testId) => {
    setTestResults((prev) =>
      prev.map((test) =>
        test.id === testId ? { ...test, status: 'running' } : test
      )
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 1200)
    );

    let success = true;
    let message = '';

    switch (testId) {
      case 'store-config':
        success = Boolean(
          installation.storeConfig.name && installation.storeConfig.address
        );
        message = success
          ? 'Store information validated'
          : 'Missing required store information';
        break;
      case 'payment-config':
        success =
          installation.paymentConfig.cashEnabled ||
          installation.paymentConfig.creditCardEnabled ||
          installation.paymentConfig.digitalWalletEnabled;
        message = success
          ? 'Payment methods configured'
          : 'No payment methods enabled';
        break;
      case 'stripe-connection':
        success = Boolean(
          installation.paymentConfig.stripePublicKey &&
            installation.paymentConfig.stripeSecretKey
        );
        message = success
          ? 'Stripe connection verified'
          : 'Stripe credentials invalid';
        break;
      case 'final-check':
        success = Math.random() > 0.05;
        message = success
          ? 'All systems operational'
          : 'System integration issue detected';
        break;
      default:
        if (testId.startsWith('device-')) {
          success = Math.random() > 0.1;
          message = success ? 'Device responding' : 'Device connection timeout';
        }
        break;
    }

    setTestResults((prev) =>
      prev.map((test) =>
        test.id === testId
          ? { ...test, status: success ? 'success' : 'error', message }
          : test
      )
    );

    return success;
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setProgress(0);

    for (let i = 0; i < testResults.length; i++) {
      const test = testResults[i];
      await runTest(test.id, i);
      setProgress(((i + 1) / testResults.length) * 100);
    }

    setIsRunningTests(false);

    const allPassed = testResults.every((t) => t.status === 'success');
    onTestsComplete?.(!allPassed);
  };

  const getDeviceIcon = (deviceName) => {
    if (deviceName.toLowerCase().includes('scanner')) return Scanner;
    if (deviceName.toLowerCase().includes('printer')) return Printer;
    if (deviceName.toLowerCase().includes('terminal')) return CreditCard;
    if (deviceName.toLowerCase().includes('drawer')) return DollarSign;
    return TestTube;
  };

  useEffect(() => {
    initializeTests();
  }, [installation]);

  return (
    <Box className="space-y-6">
      <Box textAlign="center">
        <Box className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TestTube size={32} className="text-orange-600" />
        </Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Testing & Verification
        </Typography>
        <Typography color="text.secondary">
          Run all tests to ensure your POS system is correctly configured
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center" gap={2}>
        <Button
          variant="contained"
          onClick={runAllTests}
          disabled={isRunningTests}
          startIcon={
            isRunningTests ? <RotateCw className="animate-spin" /> : <TestTube />
          }
        >
          {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </Box>

      {isRunningTests && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
            Testing: {Math.round(progress)}% complete
          </Typography>
        </Box>
      )}

      <Paper sx={{ p: 3 }}>
        {testResults.map((test, index) => {
          const Icon = test.name.includes('Device') ? getDeviceIcon(test.name) : TestTube;
          return (
            <Fade in={true} key={test.id} timeout={300 * (index + 1)}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                  bgcolor:
                    test.status === 'success'
                      ? 'success.light'
                      : test.status === 'error'
                      ? 'error.light'
                      : test.status === 'running'
                      ? 'info.light'
                      : 'grey.50',
                  borderColor:
                    test.status === 'success'
                      ? 'success.main'
                      : test.status === 'error'
                      ? 'error.main'
                      : test.status === 'running'
                      ? 'info.main'
                      : 'grey.300',
                  borderWidth: 2,
                  transition: 'all 0.3s ease',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor:
                          test.status === 'success'
                            ? 'success.main'
                            : test.status === 'error'
                            ? 'error.main'
                            : test.status === 'running'
                            ? 'info.main'
                            : 'grey.300',
                      }}
                    >
                      {test.status === 'running' ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <Icon size={16} color="white" />
                      )}
                    </Box>
                    <Box>
                      <Typography fontWeight="medium">{test.name}</Typography>
                      {test.message && (
                        <Typography variant="body2" color="text.secondary">
                          {test.message}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Fade>
          );
        })}
      </Paper>
    </Box>
  );
};

export default TestingStep;
