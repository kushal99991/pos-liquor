import { useState } from 'react';
import { Dialog, IconButton, Button, Select, MenuItem, InputAdornment, Box, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,  } from "@mui/material"
import KeyboardTextField from "components/elements/KeyboardTextField/KeyboardTextField";;
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddEditItemModal from './AddEditItemModal';

export default function ItemsModal({ open, onClose }) {
  const [filterType, setFilterType] = useState('');
  const [upcSearch, setUpcSearch] = useState('');
  const [itemNameSearch, setItemNameSearch] = useState('');
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);

  // 🆕 Use state for items so we can modify it
  const [items, setItems] = useState([
    { id: 1, sku: '50167', itemName: 'TWIX COOKIE BAR', size: '', pack: 'SINGLE', cost: 0.0, price: 1.99, stock: -6, type: 'Standard' },
    { id: 2, sku: '50170', itemName: '3 MUSKETEERS BAR', size: '', pack: 'SINGLE', cost: 0.0, price: 1.99, stock: -4, type: 'Standard' },
    { id: 3, sku: '50171', itemName: 'SNICKERS ALMOND', size: '', pack: 'SINGLE', cost: 0.0, price: 1.99, stock: -6, type: 'Standard' },
    { id: 8, sku: '51082', itemName: 'Split Pack', size: '', pack: '12-PACK', cost: 0.0, price: 15.99, stock: 10, type: 'Split Pack' },
    { id: 14, sku: '51089', itemName: 'Budweiser', size: '', pack: '', cost: 0.0, price: 2.5, stock: 2, type: 'Standard' },
  ]);

  const filteredItems = items.filter((item) => {
    const matchesUpc = upcSearch ? item.sku.toLowerCase().includes(upcSearch.toLowerCase()) : true;
    const matchesName = itemNameSearch ? item.itemName.toLowerCase().includes(itemNameSearch.toLowerCase()) : true;
    const matchesType = filterType ? item.type === filterType : true;
    return matchesUpc && matchesName && matchesType;
  });

  const handleAddClick = () => {
    setModalMode('add');
    setAddEditModalOpen(true);
  };

  const handleEditClick = () => {
    setModalMode('edit');
    setAddEditModalOpen(true);
  };

  const handleRowClick = (id) => {
    setSelectedRow((prev) => (prev === id ? null : id));
  };

  // 🆕 Clone selected item and add to bottom
  const handleClone = () => {
    if (!selectedRow) return;

    const itemToClone = items.find((item) => item.id === selectedRow);
    if (!itemToClone) return;

    const newId = Math.max(...items.map((i) => i.id)) + 1; // unique id
    const clonedItem = {
      ...itemToClone,
      id: newId,
      sku: itemToClone.sku + '-CLONE', // optional: mark it visually as clone
      itemName: itemToClone.itemName + ' (Copy)',
    };

    setItems((prev) => [...prev, clonedItem]);
    setSelectedRow(newId); // highlight the new clone
  };

  return (
    <>
     <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '98vw',
            height: '95vh',
            maxWidth: '1800px',
            margin: 0,
            borderRadius: 0,
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          bgcolor="white"
        >
          {/* Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={3}
            py={2}
            bgcolor="#a94442"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton
                onClick={onClose}
                sx={{
                  backgroundColor: "#8b3735",
                  color: "white",
                  width: 48,
                  height: 48,
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#7a2f2d" },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box
                component="h2"
                color="white"
                fontSize="1.5rem"
                fontWeight="bold"
                letterSpacing={1}
              >
                ITEM MANAGEMENT
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                displayEmpty
                IconComponent={ArrowDropDownIcon}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "6px",
                  width: 100,
                  height: 48,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Split Pack">Split Pack</MenuItem>
              </Select>

              <KeyboardTextField
                placeholder="UPC"
                value={upcSearch}
                onChange={(e) => setUpcSearch(e.target.value)}
                InputProps={{
                  endAdornment: upcSearch && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setUpcSearch("")}
                        sx={{ color: "#a94442" }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "6px",
                  width: "260px",
                  "& .MuiOutlinedInput-root": {
                    height: "48px",
                    "& fieldset": { border: "none" },
                  },
                }}
              />

              <KeyboardTextField
                placeholder="Item Name"
                value={itemNameSearch}
                onChange={(e) => setItemNameSearch(e.target.value)}
                InputProps={{
                  endAdornment: itemNameSearch && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setItemNameSearch("")}
                        sx={{ color: "#a94442" }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "6px",
                  width: "260px",
                  "& .MuiOutlinedInput-root": {
                    height: "48px",
                    "& fieldset": { border: "none" },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={3}
            py={2}
            borderBottom="2px solid #e0e0e0"
            bgcolor="white"
          >
            <Box display="flex" gap={2}>
              <Button
                onClick={handleAddClick}
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: '#a94442',
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  borderRadius: '6px',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#8b3735' },
                }}
              >
                ADD
              </Button>

              <Button
                onClick={handleEditClick}
                startIcon={<EditIcon />}
                disabled={!selectedRow}
                sx={{
                  backgroundColor: selectedRow ? '#a94442' : '#d3d3d3',
                  color: selectedRow ? 'white' : '#888',
                  px: 3,
                  py: 1.5,
                  borderRadius: '6px',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: selectedRow ? '#8b3735' : '#d3d3d3',
                  },
                }}
              >
                EDIT
              </Button>

              <Button
                startIcon={<DeleteIcon />}
                disabled={!selectedRow}
                sx={{
                  backgroundColor: selectedRow ? '#a94442' : '#d3d3d3',
                  color: selectedRow ? 'white' : '#888',
                  px: 3,
                  py: 1.5,
                  borderRadius: '6px',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: selectedRow ? '#8b3735' : '#d3d3d3',
                  },
                }}
              >
                DELETE
              </Button>

              <Button
                onClick={handleClone} // 👈 new handler
                startIcon={<ContentCopyIcon />}
                disabled={!selectedRow}
                sx={{
                  backgroundColor: selectedRow ? '#a94442' : '#d3d3d3',
                  color: selectedRow ? 'white' : '#888',
                  px: 3,
                  py: 1.5,
                  borderRadius: '6px',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: selectedRow ? '#8b3735' : '#d3d3d3',
                  },
                }}
              >
                CLONE
              </Button>
            </Box>

            <Box display="flex" alignItems="center" gap={4}>
              <Box fontSize="1rem" fontWeight={500}>
                Total : <Box component="span" fontWeight={700}>{filteredItems.length}</Box>
              </Box>
              <Button
                startIcon={<FilterAltIcon />}
                sx={{
                  backgroundColor: '#a94442',
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  borderRadius: '6px',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#8b3735' },
                }}
              >
                FILTER
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto', backgroundColor: 'white', px: 3, py: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {['SKU', 'ITEM NAME', 'SIZE', 'PACK', 'COST', 'PRICE', 'STOCK', 'TYPE', ''].map((head, i) => (
                    <TableCell
                      key={i}
                      sx={{
                        color: '#000',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: '0.875rem',
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item, index) => {
                  const isSelected = selectedRow === item.id;
                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => handleRowClick(item.id)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#a94442' : index % 2 === 0 ? 'white' : '#fafafa',
                        color: isSelected ? 'white' : 'black',
                        border: isSelected ? '2px solid #7a2f2d' : '1px solid transparent',
                        '&:hover': {
                          backgroundColor: isSelected ? '#a94442' : '#f1f1f1',
                        },
                      }}
                    >
                      <TableCell>{item.sku}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{item.itemName}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{item.pack}</TableCell>
                      <TableCell>${item.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {item.price <= 2.0 && <TrendingUpIcon sx={{ color: isSelected ? 'white' : '#5cb85c', fontSize: 16 }} />}
                          ${item.price.toFixed(2)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{item.stock}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          sx={{
                            backgroundColor: isSelected ? 'white' : '#a94442',
                            color: isSelected ? '#a94442' : 'white',
                            width: 28,
                            height: 28,
                            '&:hover': { backgroundColor: isSelected ? '#f5f5f5' : '#8b3735' },
                          }}
                        >
                          <DeleteForeverIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Dialog>

      <AddEditItemModal
        open={addEditModalOpen}
        onClose={() => {
          setAddEditModalOpen(false);
          setSelectedRow(null);
        }}
        mode={modalMode}
        selectedItem={selectedRow ? items.find(item => item.id === selectedRow) : null}
        onSave={(savedItem) => {
          if (modalMode === 'edit' && selectedRow) {
            setItems(prev => prev.map(item => item.id === selectedRow ? { ...item, ...savedItem } : item));
          } else {
            const newId = Math.max(...items.map(i => i.id), 0) + 1;
            setItems(prev => [...prev, { ...savedItem, id: newId }]);
          }
          setAddEditModalOpen(false);
          setSelectedRow(null);
        }}
      />
    </>
  );
}
