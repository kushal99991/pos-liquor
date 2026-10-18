export const mockProducts = [
  {
    id: '1',
    upc: '012345678901',
    sku: 'EN5HR',
    item_name: '5 HOUR ENERGY, $ 1.99',
    size: '1.93 OZ',
    pack: '12',
    unit_cost: 1.25,
    retail_price: 1.99,
    qoh: 48,
    surcharge: 0,
    tax_percent: 0,
    tax_amount: 0,
  },
  {
    id: '2',
    upc: '012345678902',
    sku: 'EN5HRPINK',
    item_name: '5 HOUR ENERGY PINK LEMONADE 0.50 ML, $ 3.99',
    size: '0.50 ML',
    pack: '24',
    unit_cost: 2.50,
    retail_price: 3.99,
    qoh: 72,
    surcharge: 0,
    tax_percent: 0,
    tax_amount: 0,
  },
  {
    id: '3',
    upc: '012345678903',
    sku: 'EN5HRBERRY',
    item_name: '5 HOUR ENERGY BERRY 50 ML, $ 3.99',
    size: '0.50 ML',
    pack: '24',
    unit_cost: 2.50,
    retail_price: 3.99,
    qoh: 96,
    surcharge: 0,
    tax_percent: 0,
    tax_amount: 0,
  },
];

export const searchProductsByName = (query) => {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return mockProducts.filter((product) =>
    product.item_name.toLowerCase().includes(lowerQuery)
  );
};

export const findProductByUPC = (upc) => {
  return mockProducts.find((product) => product.upc === upc);
};

export const findProductBySKU = (sku) => {
  return mockProducts.find((product) => product.sku === sku);
};
