"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface SafetyData {
  name: string
  value: number
  color: string
}

interface ChartDataItem {
  week: string
  safe: number
  caution: number
  unsafe: number
}

export function SafetyPieChart({ data, totalItems }: { data: SafetyData[]; totalItems: number }) {
  if (totalItems === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => `${entry.name} ${Math.round((entry.value / totalItems) * 100)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function SafetyBarChart({ data }: { data: ChartDataItem[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="safe" stackId="a" fill="#10b981" name="Safe" />
        <Bar dataKey="caution" stackId="a" fill="#f59e0b" name="Caution" />
        <Bar dataKey="unsafe" stackId="a" fill="#ef4444" name="Unsafe" />
      </BarChart>
    </ResponsiveContainer>
  )
}
