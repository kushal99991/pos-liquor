import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Box, Typography } from "@mui/material";

const data = [
  { name: "CASH", value: 28883.22, color: "#1E90FF" },
  { name: "CHECK", value: 21.0, color: "#00C49F" },
];

// Calculate totals
const total = data.reduce((sum, item) => sum + item.value, 0);

export default function DonutChart() {
  return (
    <>
      <Box style={{ width: "100%" }}>
        <Typography mb={2} variant="h6" className="font-semibold">
          Tender Wise (Monthly)
        </Typography>
      </Box>
      <Box className="flex items-center justify-center w-full">
        {/* Chart */}
        <Box className="w-[330px] h-[330px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* OUTER DONUT */}
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              {/* INNER CIRCLE (white) */}
              <Pie
                data={[{ value: 100 }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={75}
                fill="#F5F5F5"
                stroke="none"
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <Box className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] text-center">
            <Typography className="text-blue-600 font-semibold">
              Total ($ {total.toFixed(2)})
            </Typography>
            <Typography className="text-gray-600 mt-1">100%</Typography>
          </Box>
        </Box>

        {/* CUSTOM LEGEND */}
        <Box className="flex flex-col gap-4 ml-10">
          {data.map((item, i) => (
            <Box key={i} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              <Typography className="text-gray-800 text-sm">
                {item.name} ($ {item.value})
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
