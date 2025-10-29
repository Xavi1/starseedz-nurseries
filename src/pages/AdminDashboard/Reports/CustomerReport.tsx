import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer
} from 'recharts';
import { 
  UserPlusIcon, 
  RepeatIcon, 
  TrendingUpIcon 
} from '@heroicons/react/outline';

// Define TypeScript interfaces
interface CustomerData {
  newCustomers: number;
  returningCustomers: number;
  growthData?: Array<{
    period: string;
    new: number;
    returning: number;
    total: number;
  }>;
}

interface CustomerReportProps {
  data: CustomerData;
  timeframe: string;
}

interface GrowthDataItem {
  period: string;
  new: number;
  returning: number;
}

interface CustomerSegment {
  name: string;
  value: number;
}

interface RetentionDataItem {
  month: string;
  retention: number;
}

const CustomerReport: React.FC<CustomerReportProps> = ({ data, timeframe }) => {
  const COLORS = ['#3b82f6', '#16a34a', '#8b5cf6'];

  // Format growth data for charts
  const formattedGrowthData: GrowthDataItem[] = data.growthData?.map((item: GrowthDataItem) => ({
    period: item.period,
    new: item.new,
    returning: item.returning
  })) || [];

  const customerSegments: CustomerSegment[] = [
    { name: 'New', value: data.newCustomers },
    { name: 'Repeat', value: data.returningCustomers },
    { name: 'High Value', value: Math.floor(data.newCustomers * 0.2) } // Example calculation
  ];

  const retentionData: RetentionDataItem[] = [
    { month: 'Jan', retention: 65 },
    { month: 'Feb', retention: 68 },
    { month: 'Mar', retention: 71 },
    { month: 'Apr', retention: 69 },
    { month: 'May', retention: 74 },
    { month: 'Jun', retention: 78 },
    { month: 'Jul', retention: 82 }
  ];

  return (
    <div>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">New Customers</h4>
            <UserPlusIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data.newCustomers}</p>
          <p className="mt-1 text-sm text-green-600">+15.3% from previous period</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">Returning Customers</h4>
            <RepeatIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data.returningCustomers}</p>
          <p className="mt-1 text-sm text-green-600">+6.7% from previous period</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">Total Customers</h4>
            <TrendingUpIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.newCustomers + data.returningCustomers}
          </p>
          <p className="mt-1 text-sm text-green-600">+10.2% from previous period</p>
        </div>
      </div>

      {/* Customer Growth Chart */}
      {formattedGrowthData.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Growth</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="new" name="New Customers" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="returning" name="Returning Customers" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Segments */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Segments</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: { name: string; percent?: number }) => 
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Customer Retention */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Retention</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={retentionData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="retention" 
                    name="Retention Rate (%)" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorRetention)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReport;