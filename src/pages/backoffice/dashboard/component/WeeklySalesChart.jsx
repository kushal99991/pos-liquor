import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

import {
  Box,
  Typography,
} from "@mui/material";

const data = [
  { day: "Thu", sales: 500, tax: 50, revenue: 450 },
  { day: "Fri", sales: 1000, tax: 100, revenue: 900 },
  { day: "Sat", sales: 25000, tax: 2200, revenue: 22800 },
  { day: "Sun", sales: 4000, tax: 300, revenue: 3700 },
  { day: "Mon", sales: 0, tax: 0, revenue: 0 },
  { day: "Tue", sales: 0, tax: 0, revenue: 0 },
  { day: "Wed", sales: 0, tax: 0, revenue: 0 },
];

const stats = [
  {
    title: "Net Revenue",
    amount: "$ 118.79",
    percent: "-99.56",
  },
  {
    title: "Tax",
    amount: "$ 7.41",
    percent: "-99.56",
  },
  {
    title: "Sales",
    amount: "$ 126.20",
    percent: "-99.56",
  },
];

export default function WeeklySalesChart() {
  return (
    <>
      <Box style={{ width: "100%" }}>
        <Typography mb={2} variant="h6" className="font-semibold">
          Sales Chart (Weekly)
        </Typography>
        
        <Box className="flex items-start gap-6 mb-4">
          {stats.map((item, idx) => (
            <Box key={idx}>
              <Box className="flex flex-col pr-5 border-r border-gray-300">
                {/* TITLE */}
                <Typography fontSize={14} className="text-gray-600 text-sm font-medium">
                  {item.title}
                </Typography>

                {/* AMOUNT */}
                <Typography fontWeight={700} className="text-xl font-semibold mt-1">
                  {item.amount}
                  <span className="text-sm text-orange-500 font-normal ml-2">
                    %{item.percent}
                  </span>
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      
      <Box style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#00C4FF" stopOpacity={0.7} />
                <stop offset="90%" stopColor="#00C4FF" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />

            <Area
              type="monotone"
              dataKey="sales"
              stroke="#00C4FF"
              fillOpacity={1}
              fill="url(#colorSales)"
            />

            <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} />
            <Line type="monotone" dataKey="tax" stroke="#FF0000" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
}
