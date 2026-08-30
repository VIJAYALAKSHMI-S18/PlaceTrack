"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/Card";

interface DepartmentPlacementChartProps {
  data: { department: string; placed: number; unplaced: number; total: number; percentage: number }[];
}

export const DepartmentPlacementChart: React.FC<DepartmentPlacementChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Department-Wise Placement</CardTitle>
          <CardDescription>Placed vs Unplaced students per department</CardDescription>
        </div>
      </CardHeader>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="department" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                borderColor: "#1E293B",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="placed" name="Placed" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="unplaced" name="Unplaced" fill="#334155" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

interface PackageDistributionChartProps {
  data: { range: string; count: number }[];
}

export const PackageDistributionChart: React.FC<PackageDistributionChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>CTC Package Distribution</CardTitle>
          <CardDescription>Salary offer distribution across placed students</CardDescription>
        </div>
      </CardHeader>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="range" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                borderColor: "#1E293B",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" name="Offers" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

interface CompanyOffersChartProps {
  data: { company: string; offers: number }[];
}

export const CompanyOffersChart: React.FC<CompanyOffersChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Top Recruiting Companies</CardTitle>
          <CardDescription>Offers extended per partner enterprise</CardDescription>
        </div>
      </CardHeader>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis type="number" stroke="#64748B" fontSize={11} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="company"
              stroke="#94A3B8"
              fontSize={10}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                borderColor: "#1E293B",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="offers" name="Offers Given" fill="#818CF8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
