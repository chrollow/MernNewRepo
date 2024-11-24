import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Charts = () => {
  const [salesData, setSalesData] = useState([]);
  const [sellers, setSellers] = useState({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date()); // Default to current date
  const [endDate, setEndDate] = useState(new Date()); // Default to current date

  // Get the JWT token from localStorage or context (adjust accordingly)
  const token = localStorage.getItem('token');  // Replace with how you store the token

  // Fetch sales data from the API
  const fetchSalesData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/user/getMonthlySales', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        params: {
          startDate: startDate.toISOString(),  // Send the start date
          endDate: endDate.toISOString(),      // Send the end date
        },
      });
      setSalesData(response.data.salesData);

      // Assuming your sales data includes seller IDs, fetch seller names for display
      const sellerNames = response.data.salesData.reduce((acc, item) => {
        acc[item._id.seller] = item.sellerName; // Assuming `sellerName` is available
        return acc;
      }, {});
      setSellers(sellerNames);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setLoading(false);
    }
  };

  // Call fetchSalesData when the date range changes
  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate, token]);

  // Process the data for chart, taking into account the start and end dates
  const processedData = () => {
    if (salesData.length === 0) return [];

    // Map numeric months (1-12) to month names (January, February, etc.)
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];

    // Filter sales data to match the selected date range
    const filteredData = salesData.filter(item => {
      const saleDate = new Date(item._id.year, item._id.month - 1); // Assuming your sales data has month and year
      return saleDate >= startDate && saleDate <= endDate;
    });

    if (filteredData.length === 0) return [];

    // Group the filtered data by month and seller
    const months = Array.from(new Set(filteredData.map(item => item._id.month)))
      .sort((a, b) => a - b); // Sort months numerically to get the correct order (1 to 12)
    
    const sellers = Array.from(new Set(filteredData.map(item => item._id.seller)));

    // Prepare data for chart (one line per seller)
    const chartData = months.map(monthNumber => {
      const monthData = { month: monthNames[monthNumber - 1] }; // Convert month number to month name

      sellers.forEach(seller => {
        const sellerData = filteredData.filter(
          item => item._id.month === monthNumber && item._id.seller === seller
        );
        monthData[seller] = sellerData.length > 0 ? sellerData[0].totalSales : 0;
      });

      return monthData;
    });

    return chartData;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const chartData = processedData();

  // Color palette (you can use any color set or library)
  const colorPalette = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57", "#ffbb28"
  ];

  return (
    <div>
      <h2>Monthly Sales Chart</h2>

      {/* Date Picker for selecting start and end date */}
      <div>
        <label>Start Date:</label>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          dateFormat="yyyy/MM/dd"
        />

        <label>End Date:</label>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          dateFormat="yyyy/MM/dd"
        />
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Array.from(new Set(salesData.map(item => item._id.seller))).map((seller, index) => (
            <Line
              key={seller}
              type="monotone"
              dataKey={seller}
              stroke={colorPalette[index % colorPalette.length]} // Assign color per seller
              activeDot={{ r: 8 }}
              name={sellers[seller]} // Display seller name instead of ID
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
