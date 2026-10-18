import React from 'react';
import { 
  ShoppingCart, 
  Receipt, 
  CreditCard, 
  Store, 
  Inventory2, 
  AttachMoney,
  BarChart,
  People
} from '@mui/icons-material';

const BackgroundPattern = () => {
  const icons = [
    ShoppingCart, Receipt, CreditCard, Store, 
    Inventory2, AttachMoney, BarChart, People
  ];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-5 w-full h-full">
      <div className="relative w-full h-full">
        {Array.from({ length: 24 }, (_, i) => {
          const IconComponent = icons[i % icons.length];
          return (
            <div
              key={i}
              className="absolute text-gray-400"
              style={{
                left: `${(i % 6) * 16 + 8}%`,
                top: `${Math.floor(i / 6) * 20 + 10}%`,
                transform: `rotate(${(i * 15) % 360}deg)`,
                fontSize: '4rem',
              }}
            >
              <IconComponent fontSize="inherit" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BackgroundPattern;