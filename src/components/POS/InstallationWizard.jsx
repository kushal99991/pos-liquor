import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Box, Button, Container, Paper, Stepper, Step, StepLabel, Typography } from '@mui/material';
import { nextStep, previousStep, setStoreId } from 'store/slice/pos.slice';
import StoreInfoStep from './steps/StoreInfoStep';
import PaymentSetupStep from './steps/PaymentSetupStep';
import DeviceConfigStep from './steps/DeviceConfigStep';
import TestingStep from './steps/TestingStep';
import CompletionStep from './steps/CompletionStep';
import { useStoreInstallationMutation } from 'services/storeSlice';
import useSnackbar from 'hooks/useSnackbar';

const InstallationWizard = () => {
  const dispatch = useDispatch();
  const { openSnackbar } = useSnackbar();
  const { installationSteps, installation } = useSelector((state) => state.pos);
  const [isStepValid, setIsStepValid] = useState(false);
  const [storeInstallation] = useStoreInstallationMutation();
  const [isInstalling, setIsInstalling] = useState(false);

  const currentStepComponent = () => {
    switch (installation.currentStep) {
      case 0:
        return <StoreInfoStep onValidityChange={setIsStepValid} />;
      case 1:
        return <PaymentSetupStep onValidityChange={setIsStepValid} />;
      case 2:
        return <DeviceConfigStep onValidityChange={setIsStepValid} />;
      case 3:
        return (
          <TestingStep
            installation={installation}
            onTestsComplete={setIsStepValid}
          />
        );
      case 4:
        return <CompletionStep />;
      default:
        return <StoreInfoStep onValidityChange={setIsStepValid} />;
    }
  };

  const handleNext = async () => {
    // On TestingStep -> Finish button triggers store installation
    if (installation.currentStep === 3) {
      if (!isStepValid) return;
      try {
        setIsInstalling(true);
        const payload = {
          name: installation.storeConfig.name,
          email: installation.storeConfig.email,
          address: installation.storeConfig.address,
          phone: installation.storeConfig.phone,
          taxRate: installation.storeConfig.taxRate,
          currency: installation.storeConfig.currency,
          timezone: installation.storeConfig.timezone,
          paymentConfig: installation.paymentConfig,
          devices: installation.devices,
          isComplete: true,
        };
        const response = await storeInstallation(payload);
        if (response?.error) {
          setIsStepValid(false)
          openSnackbar(response.error, "error")
          return false;
        }
        const storeId = response?.data?.store_id;
        console.log(storeId, "storeId");
        
        if (storeId) {
          dispatch(setStoreId(storeId));
          console.log('Store ID saved to localStorage:', storeId);
        }

        dispatch(nextStep());
      } catch (error) {
        console.error(error);
      } finally {
        setIsInstalling(false);
      }
      return;
    }
    if (installation.currentStep === 2) {
      setIsStepValid(false)
    }
    dispatch(nextStep());
  };

  const handlePrevious = () => dispatch(previousStep());

  const isLastStep = installation.currentStep === 3; // Finish button on TestingStep

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(to bottom right, #EFF6FF, #FFFFFF, #F3E8FF)' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight="bold">POS System Installation</Typography>
          <Typography variant="h6" color="text.secondary">
            Set up your point of sale system in just a few steps
          </Typography>
        </Box>

        <Box mb={6}>
          <Stepper activeStep={installation.currentStep} alternativeLabel>
            {installationSteps.map((step, index) => (
              <Step key={index} completed={step.completed}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 4, p: 4, mb: 4, minHeight: 400 }}>
          {currentStepComponent()}
        </Paper>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            onClick={handlePrevious}
            disabled={installation.currentStep === 0}
            startIcon={<ChevronLeft />}
          >
            Previous
          </Button>

          <Typography variant="body2" color="text.secondary">
            Step {installation.currentStep + 1} of {installationSteps.length}
          </Typography>

          <Button
            onClick={handleNext}
            disabled={!isStepValid || isInstalling}
            variant="contained"
            endIcon={<ChevronRight />}
          >
            {isLastStep ? (isInstalling ? 'Installing...' : 'Finish') : 'Next'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default InstallationWizard;
