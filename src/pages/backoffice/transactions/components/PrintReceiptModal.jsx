import { Dialog, Box, Button } from '@mui/material';
import Barcode from 'react-barcode';
import { useSelector } from 'react-redux';

const PrintReceiptModal = ({ open, onClose, transaction }) => {
  const storeConfig = useSelector(
    (state) => state.pos.installation.storeConfig
  );

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';

    const parsedDate = new Date(dateStr);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return typeof dateStr === 'string' ? dateStr.replace(',', ' ') : String(dateStr);
  };

  const storeInfo = {
    name: storeConfig?.name ?? 'GloryPOS Demo Store',
    address: storeConfig?.address ?? '2974 N Expy',
    city: 'Griffin Georgia - 30223',
    phone: storeConfig?.phone ?? '8883425659',
  };

  const receiptDetails = {
    receiptDate: formatDate(transaction.date),
    salesDate: formatDate(transaction.salesDate),
    registerNo: '10',
    batch: '19',
    orderId: transaction.barcode,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '4px',
          maxWidth: '500px',
        },
      }}
    >
      <Box className="bg-white p-8">
        {/* 👇 Add this <style> block */}
        <style>
          {`
            @media print {
              .no-print {
                display: none !important;
              }
            }
          `}
        </style>

        <Box
          className="bg-white border-2 border-gray-300 p-6"
          sx={{
            fontFamily: 'Courier New, monospace',
          }}
        >
          {/* --- Store Info --- */}
          <Box className="text-center mb-4">
            <div className="font-bold text-lg">{storeInfo.name}</div>
            <div className="text-sm">{storeInfo.address}</div>
            <div className="text-sm">{storeInfo.city}</div>
            <div className="text-sm">Phone : {storeInfo.phone}</div>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          {/* --- Dates --- */}
          <Box className="flex justify-between text-sm mb-1">
            <span>Receipt Date :</span>
            <span>{receiptDetails.receiptDate}</span>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Sales Date :</span>
            <span>{receiptDetails.salesDate}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <Box className="flex-1">Register No. {receiptDetails.registerNo}</Box>
            <Box className="flex-1 text-right">Batch : {receiptDetails.batch}</Box>
          </Box>

          <Box className="text-sm mb-1">
            POS OrderId : {receiptDetails.orderId}
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          {/* --- Item List --- */}
          <Box className="flex justify-between text-sm font-bold mb-2">
            <span>Item Name</span>
            <Box>
              <span className="inline-block w-16 text-center">Qty</span>
              <span className="inline-block w-20 text-right">Price</span>
            </Box>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-2"></Box>

          {transaction.items?.map((item, index) => (
            <Box key={index} className="mb-2">
              <Box className="flex justify-between text-sm">
                <span>{item.name}</span>
                <Box>
                  <span className="inline-block w-16 text-center">{item.qty}</span>
                  <span className="inline-block w-20 text-right">{item.price}</span>
                </Box>
              </Box>
            </Box>
          ))}

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          {/* --- Totals --- */}
          <Box className="flex justify-between text-sm mb-1">
            <span>
              SubTotal : [QTY :
              {transaction.items?.reduce((sum, item) => sum + item.qty, 0) || 0}]
            </span>
            <span>${transaction.subtotal.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Discount :</span>
            <span>${transaction.discount.toFixed(2)}</span>
          </Box>
          <Box className="flex justify-between text-sm mb-1">
            <span>Tax :</span>
            <span>${transaction?.tax?.toFixed(2) || "0.00"}</span>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          <Box className="flex justify-between text-lg font-bold mb-1">
            <span>Total Charge :</span>
            <span>${transaction.total.toFixed(2)}</span>
          </Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>Amount Collected :</span>
            <span>$0.00</span>
          </Box>

          <Box className="flex justify-between text-sm mb-3">
            <span>Change Due :</span>
            <span>$0.00</span>
          </Box>

          <Box className="text-sm font-bold mb-2">Tender</Box>

          <Box className="flex justify-between text-sm mb-1">
            <span>{transaction.paymentType} :</span>
            <span>${transaction.total.toFixed(2)}</span>
          </Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          <Box className="flex justify-between text-sm mb-3">
            <span>Total Tendered :</span>
            <span>${transaction.total.toFixed(2)}</span>
          </Box>

          <Box className="text-sm font-bold mb-2">Other Details</Box>

          <Box className="border-t-2 border-dashed border-gray-400 my-3"></Box>

          <Box className="flex justify-center my-6">
            <Barcode
              value={transaction.barcode.replace(/-/g, '')}
              width={1.5}
              height={60}
              fontSize={12}
              displayValue={true}
            />
          </Box>
        </Box>

        {/* 👇 Hide this section during print */}
        <Box className="flex justify-center gap-4 mt-6 no-print">
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              backgroundColor: '#8b0000',
              '&:hover': { backgroundColor: '#6b0000' },
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '16px',
              px: 8,
              py: 1.5,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePrint}
            sx={{
              backgroundColor: '#8b0000',
              '&:hover': { backgroundColor: '#6b0000' },
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '16px',
              px: 8,
              py: 1.5,
            }}
          >
            Print
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default PrintReceiptModal;

