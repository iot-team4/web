import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function SensorChart({ data, selectedSensor }) {
  const showAll = selectedSensor === "all";

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      marginBottom: '40px'
    }}>
      <h2 style={{
        fontSize: '22px',
        marginBottom: '20px',
        color: '#333',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px'
      }}>📈 시간대별 센서 변화</h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ccc", fontSize: "13px" }} />
          <Legend verticalAlign="top" height={36} />

          {(showAll || selectedSensor === "temperature") && (
            <Line
              type="monotone"
              dataKey="temperature"
              name="🌡️ 온도(°C)"
              stroke="#ff4d4f"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          )}

          {(showAll || selectedSensor === "humidity") && (
            <Line
              type="monotone"
              dataKey="humidity"
              name="💧 습도(%)"
              stroke="#1e88e5"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          )}

          {(showAll || selectedSensor === "pm25") && (
            <Line
              type="monotone"
              dataKey="pm25"
              name="🌫️ 미세먼지(㎍/㎥)"
              stroke="#757575"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SensorChart;
