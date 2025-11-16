"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { getPaymentsAction } from "@/server/actions/admin/dashboard.admin.actions";

interface Payment {
  amount: number;
  status: string;
  createdAt: Date;
}

const PaymentsChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const payments: Payment[] = await getPaymentsAction();
      
      // Group payments by day
      const grouped: Record<string, number> = {};
      payments.forEach((p) => {
        const day = format(new Date(p.createdAt), "yyyy-MM-dd");
        grouped[day] = (grouped[day] || 0) + p.amount;
      });

      const chartData = Object.keys(grouped).map((day) => ({
        date: day,
        amount: grouped[day],
      }));

      setData(chartData);
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Legend />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PaymentsChart;
