import {
  Dialog,
  Box,
  IconButton,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
} from '@mui/material';
import { Cancel, AddCircle } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState } from 'react';
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";

const AdvancedFilterModal = ({ open, onClose }) => {
  const [startDate, setStartDate] = useState(new Date('2024-08-20T00:00'));
  const [endDate, setEndDate] = useState(new Date('2024-08-20T09:31'));
  const [priceFrom, setPriceFrom] = useState('0.00');
  const [priceTo, setPriceTo] = useState('0.00');
  const [employee, setEmployee] = useState('');
  const [status, setStatus] = useState('');
  const [regNo, setRegNo] = useState('10');
  const [searchUpc, setSearchUpc] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('0.00');
  const [cardNumbers, setCardNumbers] = useState({
    credit: '',
    debit: '',
    ebt: '',
    ebtCash: '',
  });
  const [cardTypes, setCardTypes] = useState({
    credit: '',
    debit: '',
  });
  const [tenderTypes, setTenderTypes] = useState({
    cash: false,
    credit: false,
    check: false,
    debit: false,
    houseAccount: false,
    ebt: false,
    ebtCash: false,
  });

  const handleReset = () => {
    setStartDate(new Date('2024-08-20T00:00'));
    setEndDate(new Date('2024-08-20T09:31'));
    setPriceFrom('0.00');
    setPriceTo('0.00');
    setEmployee('');
    setStatus('');
    setRegNo('10');
    setSearchUpc('');
    setItemName('');
    setItemPrice('0.00');
    setCardNumbers({ credit: '', debit: '', ebt: '', ebtCash: '' });
    setCardTypes({ credit: '', debit: '' });
    setTenderTypes({
      cash: false,
      credit: false,
      check: false,
      debit: false,
      houseAccount: false,
      ebt: false,
      ebtCash: false,
    });
  };

  const handleApply = () => {
    console.log('Applying filters');
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '4px',
            maxWidth: '1000px',
          },
        }}
      >
        <Box className="bg-white">
          <Box className="bg-[#8b0000] text-white px-6 py-4 flex items-center justify-between">
            <span className="text-2xl font-bold tracking-wide">ADVANCE FILTER</span>
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <Cancel />
            </IconButton>
          </Box>

          <Box className="p-6">
            <Box className="mb-6 bg-gray-600 text-white px-4 py-2 rounded">
              <span className="font-bold text-sm">Range</span>
            </Box>

            <Box className="grid grid-cols-2 gap-6 mb-6">
              <Box>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Start Date :
                </label>
                <DateTimePicker
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: '45px',
                    },
                  }}
                />
              </Box>
              <Box>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  End Date :
                </label>
                <DateTimePicker
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: '45px',
                    },
                  }}
                />
              </Box>
            </Box>

            <Box className="mb-6">
              <label className="inline-block text-sm font-semibold mr-4 text-gray-700">
                Price Range :
              </label>
              <Box className="inline-flex items-center gap-4">
                <KeyboardTextField
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  size="small"
                  sx={{ width: '120px' }}
                />
                <span className="font-bold text-gray-700">To</span>
                <KeyboardTextField
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  size="small"
                  sx={{ width: '120px' }}
                />
              </Box>
            </Box>

            <Box className="mb-6 bg-gray-600 text-white px-4 py-2 rounded">
              <span className="font-bold text-sm">Others</span>
            </Box>

            <Box className="grid grid-cols-3 gap-6 mb-6">
              <Box>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Employee :
                </label>
                <Select
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  displayEmpty
                  size="small"
                  fullWidth
                  sx={{ backgroundColor: 'white' }}
                >
                  <MenuItem value="">
                    <span className="text-gray-400">Select Employee</span>
                  </MenuItem>
                  <MenuItem value="emp1">Employee 1</MenuItem>
                  <MenuItem value="emp2">Employee 2</MenuItem>
                </Select>
              </Box>
              <Box>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Status :
                </label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  displayEmpty
                  size="small"
                  fullWidth
                  sx={{ backgroundColor: 'white' }}
                >
                  <MenuItem value="">
                    <span className="text-gray-400">Status</span>
                  </MenuItem>
                  <MenuItem value="complete">Complete</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </Box>
              <Box>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Reg.No :
                </label>
                <Select
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ backgroundColor: 'white' }}
                >
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="20">20</MenuItem>
                </Select>
              </Box>
            </Box>

            <Box className="mb-6 bg-gray-600 text-white px-4 py-2 rounded">
              <span className="font-bold text-sm">Contains Item</span>
            </Box>

            <Box className="flex items-center gap-4 mb-6">
              <Box className="flex-1">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Contains Item.. :
                </label>
                <KeyboardTextField
                  value={searchUpc}
                  onChange={(e) => setSearchUpc(e.target.value)}
                  placeholder="Scan / Search Upc"
                  size="small"
                  fullWidth
                />
              </Box>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#8b0000',
                  '&:hover': { backgroundColor: '#6b0000' },
                  textTransform: 'none',
                  fontWeight: 700,
                  mt: 3.5,
                  height: '40px',
                  px: 4,
                }}
              >
                Search
              </Button>
              <Box className="flex-1">
                <KeyboardTextField
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Item Name,Size,Pack"
                  size="small"
                  fullWidth
                  sx={{ mt: 3.5 }}
                />
              </Box>
              <Box className="w-32">
                <KeyboardTextField
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ mt: 3.5 }}
                />
              </Box>
              <IconButton
                sx={{
                  backgroundColor: '#8b0000',
                  color: 'white',
                  '&:hover': { backgroundColor: '#6b0000' },
                  width: '40px',
                  height: '40px',
                  mt: 3.5,
                }}
              >
                <AddCircle />
              </IconButton>
            </Box>

            <Box className="mb-6 bg-gray-600 text-white px-4 py-2 rounded">
              <span className="font-bold text-sm">Tender</span>
            </Box>

            <Box className="grid grid-cols-2 gap-6 mb-6">
              <Box>
                <Box className="flex gap-4 mb-3">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tenderTypes.cash}
                        onChange={(e) =>
                          setTenderTypes({ ...tenderTypes, cash: e.target.checked })
                        }
                      />
                    }
                    label={<span className="font-semibold text-gray-700">Cash</span>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tenderTypes.credit}
                        onChange={(e) =>
                          setTenderTypes({ ...tenderTypes, credit: e.target.checked })
                        }
                      />
                    }
                    label={<span className="font-semibold text-gray-700">Credit</span>}
                  />
                </Box>

                {tenderTypes.credit && (
                  <Box className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-600">Card No. : XXXX</span>
                    <KeyboardTextField
                      value={cardNumbers.credit}
                      onChange={(e) =>
                        setCardNumbers({ ...cardNumbers, credit: e.target.value })
                      }
                      placeholder="Card No."
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <span className="text-sm font-semibold text-gray-700">Card Type :</span>
                    <Select
                      value={cardTypes.credit}
                      onChange={(e) => setCardTypes({ ...cardTypes, credit: e.target.value })}
                      displayEmpty
                      size="small"
                      sx={{ flex: 1 }}
                    >
                      <MenuItem value="">
                        <span className="text-gray-400">&lt;Select Card Type&gt;</span>
                      </MenuItem>
                      <MenuItem value="visa">Visa</MenuItem>
                      <MenuItem value="mastercard">Mastercard</MenuItem>
                    </Select>
                  </Box>
                )}

                <Box className="flex gap-4 mb-3">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tenderTypes.check}
                        onChange={(e) =>
                          setTenderTypes({ ...tenderTypes, check: e.target.checked })
                        }
                      />
                    }
                    label={<span className="font-semibold text-gray-700">Check</span>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tenderTypes.debit}
                        onChange={(e) =>
                          setTenderTypes({ ...tenderTypes, debit: e.target.checked })
                        }
                      />
                    }
                    label={<span className="font-semibold text-gray-700">Debit</span>}
                  />
                </Box>

                {tenderTypes.debit && (
                  <Box className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-600">Card No. : XXXX</span>
                    <KeyboardTextField
                      value={cardNumbers.debit}
                      onChange={(e) =>
                        setCardNumbers({ ...cardNumbers, debit: e.target.value })
                      }
                      placeholder="Card No."
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <span className="text-sm font-semibold text-gray-700">Card Type :</span>
                    <Select
                      value={cardTypes.debit}
                      onChange={(e) => setCardTypes({ ...cardTypes, debit: e.target.value })}
                      displayEmpty
                      size="small"
                      sx={{ flex: 1 }}
                    >
                      <MenuItem value="">
                        <span className="text-gray-400">&lt;Select Card Type&gt;</span>
                      </MenuItem>
                      <MenuItem value="visa">Visa</MenuItem>
                      <MenuItem value="mastercard">Mastercard</MenuItem>
                    </Select>
                  </Box>
                )}
              </Box>

              <Box>
                <Box className="flex gap-4 mb-3">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tenderTypes.houseAccount}
                        onChange={(e) =>
                          setTenderTypes({ ...tenderTypes, houseAccount: e.target.checked })
                        }
                      />
                    }
                    label={<span className="font-semibold text-gray-700">House Account</span>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tenderTypes.ebt}
                        onChange={(e) =>
                          setTenderTypes({ ...tenderTypes, ebt: e.target.checked })
                        }
                      />
                    }
                    label={<span className="font-semibold text-gray-700">EBT</span>}
                  />
                </Box>

                {tenderTypes.ebt && (
                  <Box className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-600">Card No. : XXXX</span>
                    <KeyboardTextField
                      value={cardNumbers.ebt}
                      onChange={(e) =>
                        setCardNumbers({ ...cardNumbers, ebt: e.target.value })
                      }
                      placeholder="Card No."
                      size="small"
                      fullWidth
                    />
                  </Box>
                )}

                <Box className="mb-3">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tenderTypes.ebtCash}
                        onChange={(e) =>
                          setTenderTypes({ ...tenderTypes, ebtCash: e.target.checked })
                        }
                      />
                    }
                    label={<span className="font-semibold text-gray-700">EBT CASH</span>}
                  />
                </Box>

                {tenderTypes.ebtCash && (
                  <Box className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-600">Card No. : XXXX</span>
                    <KeyboardTextField
                      value={cardNumbers.ebtCash}
                      onChange={(e) =>
                        setCardNumbers({ ...cardNumbers, ebtCash: e.target.value })
                      }
                      placeholder="Card No."
                      size="small"
                      fullWidth
                    />
                  </Box>
                )}
              </Box>
            </Box>

            <Box className="flex justify-end gap-4 mt-8">
              <Button
                variant="contained"
                onClick={handleApply}
                sx={{
                  backgroundColor: '#8b0000',
                  '&:hover': { backgroundColor: '#6b0000' },
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '16px',
                  px: 6,
                  py: 1.5,
                }}
              >
                Apply
              </Button>
              <Button
                variant="contained"
                onClick={handleReset}
                sx={{
                  backgroundColor: '#8b0000',
                  '&:hover': { backgroundColor: '#6b0000' },
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '16px',
                  px: 6,
                  py: 1.5,
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AdvancedFilterModal;

