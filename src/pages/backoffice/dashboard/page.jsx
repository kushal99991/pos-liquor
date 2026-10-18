import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import BarChartIcon from '@mui/icons-material/BarChart';

import WeeklySalesChart from "../dashboard/component/WeeklySalesChart";
import DonutChart from "../dashboard/component/DonutChart";

const summaryCards = [
  {
    title: "Today Sales",
    value: "$ 126.20",
    icon: BarChartIcon,
    iconColor: "bg-[#e30207]",
    trend: "+ 0.00 %",
    bottom: "Yesterday Sales : $ 0.00",
  },
  {
    title: "Today Void",
    value: "$ 41.15",
    icon: BarChartIcon,
    iconColor: "bg-[#13c33f]",
    trend: "+ 0.00 %",
    bottom: "Yesterday Void : $ 0.00",
  },
  {
    title: "Today Delete",
    value: "$ 92.37",
    icon: BarChartIcon,
    iconColor: "bg-[#fd5400]",
    trend: "+ 4541.71 %",
    bottom: "Yesterday Deleted : $ 1.99",
  },
  {
    title: "Today Return",
    value: "$ 2.11",
    icon: BarChartIcon,
    iconColor: "bg-[#5093ff]",
    trend: "+ 0.00 %",
    bottom: "Yesterday Return : $ 0.00",
  },
];

const BackOfficeDashboard = () => {
  return (
    <Box className="p-6 space-y-6">
        {/* Summary Cards */}
        <Grid container spacing={{ sm: 2, md: 3 }}>
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
            <Grid key={card.title} size={{ sm: 6, md: 3 }}>
              <Paper className="p-5 rounded-xl shadow-sm bg-white w-full flex items-center">
                <Box className={`w-16 h-16 rounded-full mr-3 flex items-center justify-center ${card.iconColor}`}>
                  <Icon className="text-3xl text-white" />
                </Box>
                <Box className="w-[calc(100%-80px)]">
                  <Typography className="text-[#3e3e3e] text-sm">
                    {card.title}
                  </Typography>

                  <Box className="flex items-center gap-3 my-1">
                    <Typography variant="h5" className="!font-bold text-[#3e3e3e]">
                      {card.value}
                    </Typography>
                  </Box>

                  <Typography className="text-emerald-500 text-sm mt-1">
                    {card.trend}
                  </Typography>

                  <Box className="my-1 inline-block w-full h-0.5 bg-[#d7d7d7]"></Box>

                  <Typography className="text-gray-500 !text-xs !font-medium">
                    {card.bottom}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            );
          })}
        </Grid>

        {/* Charts row */}
        <Grid container spacing={{ sm: 3 }}>
          <Grid size={{ sm: 6 }}>
            <Box style={{ height: "100%" }} className="rounded-xl p-5 shadow-sm bg-white">
              <WeeklySalesChart />
            </Box>
          </Grid>
          <Grid size={{ sm: 6 }}>
            <Box style={{ height: "100%" }} className="rounded-xl p-5 shadow-sm bg-white">
              <DonutChart />
            </Box>
          </Grid>
        </Grid>
    </Box>
  );
};

export default BackOfficeDashboard;
