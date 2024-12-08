import { Training } from "@/types/Training";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProgressChart = ({ history }: { history: Training[] }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={history}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="startTime"
          tickFormatter={formatDate}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          labelFormatter={formatDate}
          formatter={(value: number) => [`${value}`, "Performance"]}
        />
        <Line
          type="monotone"
          dataKey="performance"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ fill: "#8884d8", strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
