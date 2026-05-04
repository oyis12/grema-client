// import React, { useState, useEffect } from "react";
// import {
//   PieChart,
//   Pie,
//   LineChart,
//   Line,
//   Cell,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";
// import axios from "axios";
// import { useAuthConfig } from "../../context/AppState";
// import { message, DatePicker, Table, Select, Spin, Button, Space } from "antd";
// import { useNavigate } from "react-router";
// import dayjs from "dayjs";
// import DotLoader from "react-spinners/DotLoader";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable"; // Import the function directly
// import localizedFormat from "dayjs/plugin/localizedFormat";
// dayjs.extend(localizedFormat);


// const COLORS = [
//   "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666",
//   "#A28CFF", "#33CCCC", "#FF33A1", "#66FF66", "#FF9933",
// ];

// const Dashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [salesTrends, setSalesTrends] = useState([]);
//   const [cashierBreakdown, setCashierBreakdown] = useState([]);
//   const [topProducts, setTopProducts] = useState([]);
//   const [categorySummary, setCategorySummary] = useState([]);
//   const [summary, setSummary] = useState({});
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [dailySales, setDailySales] = useState(0);
//   const [viewChart, setViewChart] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
//   const [selectedYear, setSelectedYear] = useState(dayjs().year());

//   const [messageApi, contextHolder] = message.useMessage();
//   const { baseUrl, token } = useAuthConfig();
//   const navigate = useNavigate();

//   const fetchDashboardData = async (isSilent = false) => {
//     if (!token) return;
//     if (!isSilent) setLoading(true);
//     else setRefreshing(true);

//     try {
//       const response = await axios.get(
//         `${baseUrl}/dashboard?month=${selectedMonth}&year=${selectedYear}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const data = response.data;
//       setSummary(data.monthlySummary || {});
//       setSalesTrends(data.salesTrends || []);
//       setTopProducts(data.topProducts || []);
//       setCashierBreakdown(data.cashierBreakdown || []);
//       setCategorySummary(data.categorySummary || []);
      
//       const selectedStr = selectedDate.format("YYYY-MM-DD");
//       const found = data.salesTrends?.find(item => item.date === selectedStr);
//       setDailySales(found?.totalSales || 0);

//     } catch (err) {
//       console.error("Dashboard fetch error:", err);
//       messageApi.error("Failed to load dashboard data.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, [selectedMonth, selectedYear, token]);

//   const handleDateChange = (date) => {
//     if (!date) return;
//     setSelectedDate(date);
//     const selectedStr = date.format("YYYY-MM-DD");
//     const found = salesTrends.find(item => item.date === selectedStr);
//     setDailySales(found?.totalSales || 0);
//   };

// const downloadPDFReport = () => {
//     const doc = new jsPDF();
//     const dateStr = dayjs().format("YYYY-MM-DD_HH-mm");

//     // Helper to replace the Naira symbol with "N" to avoid encoding errors
//     const formatCurrencyForPDF = (val) => {
//       if (!val) return "N0.00";
//       // Replaces the Unicode Naira symbol with a standard 'N'
//       return typeof val === "string" ? val.replace(/₦/g, "N") : `N${val.toLocaleString()}`;
//     };

//     doc.setFontSize(18);
//     doc.text("Sales Dashboard Report", 14, 20);
//     doc.setFontSize(11);
//     doc.text(`Period: ${dayjs().month(selectedMonth - 1).format("MMMM")} ${selectedYear}`, 14, 30);
//     doc.text(`Generated on: ${dayjs().format("lll")}`, 14, 37);

//     // Summary Statistics
//     autoTable(doc, {
//       startY: 45,
//       head: [['Metric', 'Value']],
//       body: [
//         ['Monthly Revenue', formatCurrencyForPDF(summary.formattedActualRevenue)],
//         ['Potential Revenue', formatCurrencyForPDF(summary.formattedPotentialRevenue)],
//         ['Negotiation Loss Rate', `${summary.negotiationLossRate || 0}%`],
//         ['Total Transactions', summary.totalTransactions || 0],
//         ['Total Area Sold', summary.formattedAreaSold || "0 sqm"],
//       ],
//       theme: 'striped',
//       headStyles: { fillStyle: [31, 41, 55] },
//     });

//     const finalY = doc.lastAutoTable.finalY;

//     // Top Products Table
//     doc.setFontSize(14);
//     doc.text("Top Selling Products", 14, finalY + 15);

//     autoTable(doc, {
//       startY: finalY + 20,
//       head: [['Product', 'Qty Sold', 'Revenue']],
//       body: topProducts.map(p => [
//         p.title, 
//         p.totalSold, 
//         formatCurrencyForPDF(p.formattedRevenue)
//       ]),
//       theme: 'grid',
//       headStyles: { fillStyle: [79, 70, 229] },
//     });

//     doc.save(`Dashboard_Report_${dateStr}.pdf`);
//   };
//   const productColumns = [
//     { title: "Product Name", dataIndex: "title", key: "title" },
//     { title: "Qty Sold", dataIndex: "totalSold", key: "totalSold" },
//     { title: "Revenue", dataIndex: "formattedRevenue", key: "formattedRevenue" },
//   ];

//   const cashierColumns = [
//     { title: "Cashier", dataIndex: "name", key: "name" },
//     { title: "Transactions", dataIndex: "transactions", key: "transactions" },
//     { title: "Sales", dataIndex: "formattedSales", key: "formattedSales" },
//     { 
//         title: "Loss Rate", 
//         dataIndex: "discountPercentage", 
//         key: "discountPercentage",
//         render: (val) => `${val}%`
//     },
//   ];

//   return (
//     <div className="p-4">
//       {contextHolder}
      
//       {/* Header Actions */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Business Overview</h1>
//         <Button 
//           type="primary" 
//           className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
//           onClick={downloadPDFReport}
//         >
//           📄 Download PDF Report
//         </Button>
//       </div>

//       {refreshing && (
//         <div className="absolute top-4 right-6 z-10">
//           <Spin size="small" />
//         </div>
//       )}

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//         <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl shadow-lg p-4">
//           <div className="flex justify-between items-start mb-2">
//             <div className="bg-white/20 p-3 rounded-lg text-xl">💰</div>
//             <div className="text-right">
//               <p className="opacity-80 text-sm">Monthly Revenue</p>
//               <h2 className="font-bold text-2xl">{summary.formattedActualRevenue || "₦0.00"}</h2>
//             </div>
//           </div>
//           <div className="flex gap-2 mt-2">
//             <Select
//               size="small"
//               className="w-full"
//               value={selectedMonth}
//               onChange={setSelectedMonth}
//               options={Array.from({ length: 12 }, (_, i) => ({
//                 value: i + 1,
//                 label: dayjs().month(i).format("MMMM"),
//               }))}
//             />
//             <Select
//               size="small"
//               value={selectedYear}
//               onChange={setSelectedYear}
//               options={[2024, 2025, 2026].map(y => ({ value: y, label: y }))}
//             />
//           </div>
//         </div>

//         <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-xl shadow-lg p-4">
//           <div className="flex justify-between items-start mb-2">
//             <div className="bg-white/20 p-3 rounded-lg text-xl">📅</div>
//             <div className="text-right">
//               <p className="opacity-80 text-sm">Daily Sales</p>
//               <h2 className="font-bold text-2xl">₦{dailySales.toLocaleString()}</h2>
//             </div>
//           </div>
//           <DatePicker
//             size="small"
//             className="w-full"
//             allowClear={false}
//             value={selectedDate}
//             onChange={handleDateChange}
//           />
//         </div>

//         <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg p-4">
//           <div className="flex items-center">
//             <div className="bg-white/20 p-3 rounded-lg text-xl">📈</div>
//             <div className="ml-4">
//               <p className="opacity-80 text-sm">Potential Revenue</p>
//               <h2 className="font-bold text-2xl">{summary.formattedPotentialRevenue || "₦0.00"}</h2>
//               <p className="text-xs">Loss Rate: {summary.negotiationLossRate}%</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-4">
//           <div className="flex items-center">
//             <div className="bg-white/20 p-3 rounded-lg text-xl">🧾</div>
//             <div className="ml-4">
//               <p className="opacity-80 text-sm">Transactions</p>
//               <h2 className="font-bold text-2xl">{summary.totalTransactions || 0}</h2>
//               <p className="text-xs">Area Sold: {summary.formattedAreaSold || "0 sqm"}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Charts Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <h2 className="font-bold text-gray-700 mb-4">Top Selling Products</h2>
//           <Table
//             loading={loading}
//             size="small"
//             columns={productColumns}
//             dataSource={topProducts}
//             rowKey="_id"
//             pagination={{ pageSize: 5 }}
//             className="custom-pagination"
//           />
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <h2 className="font-bold text-gray-700 mb-4">7-Day Sales Trend</h2>
//           <div className="h-[300px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={salesTrends}>
//                 <XAxis dataKey="date" tick={{fontSize: 12}} />
//                 <YAxis tick={{fontSize: 12}} />
//                 <Tooltip 
//                   formatter={(val) => `₦${val.toLocaleString()}`}
//                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="totalSales" 
//                   stroke="#6366f1" 
//                   strokeWidth={3} 
//                   dot={{ r: 4 }} 
//                   activeDot={{ r: 6 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="font-bold text-gray-700">Cashier Performance</h2>
//             <Button 
//               type="primary" 
//               size="small"
//               ghost
//               onClick={() => setViewChart(!viewChart)}
//             >
//               {viewChart ? "Show Table" : "Show Chart"}
//             </Button>
//           </div>
          
//           {viewChart ? (
//             <div className="h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={cashierBreakdown}>
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip formatter={(val) => `₦${val.toLocaleString()}`} />
//                   <Bar dataKey="totalSales" fill="#10b981" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <Table
//               loading={loading}
//               size="small"
//               columns={cashierColumns}
//               dataSource={cashierBreakdown}
//               rowKey="cashierId"
//               className="custom-pagination"
//               pagination={{ pageSize: 5, position: "center" }}
//               onRow={(record) => ({
//                 onClick: () => navigate(`/dashboard/cashier-details/${record.cashierId}`),
//                 className: "cursor-pointer hover:bg-blue-50 transition-colors"
//               })}
//             />
//           )}
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <h2 className="font-bold text-gray-700 mb-4">Sales by Category</h2>
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={categorySummary}
//                   dataKey="totalSales"
//                   nameKey="categoryName"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                   label={(entry) => entry.categoryName}
//                 >
//                   {categorySummary.map((_, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(val) => `₦${val.toLocaleString()}`} />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axios from "axios";
import { useAuthConfig } from "../../context/AppState";
import { message, DatePicker, Table, Select, Spin, Button, Tag } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666",
  "#A28CFF", "#33CCCC", "#FF33A1", "#66FF66", "#FF9933",
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salesTrends, setSalesTrends] = useState([]);
  const [cashierBreakdown, setCashierBreakdown] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dailySales, setDailySales] = useState(0);
  const [viewChart, setViewChart] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  const [messageApi, contextHolder] = message.useMessage();
  const { baseUrl, token } = useAuthConfig();
  const navigate = useNavigate();

  const fetchDashboardData = async (isSilent = false) => {
    if (!token) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await axios.get(
        `${baseUrl}/dashboard?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(response)

      const data = response.data;
      setSummary(data.monthlySummary || {});
      setSalesTrends(data.salesTrends || []);
      setTopProducts(data.topProducts || []);
      setCashierBreakdown(data.cashierBreakdown || []);
      setCategorySummary(data.categorySummary || []);
      
      // Update Daily Sales display based on date picker
      const selectedStr = selectedDate.format("YYYY-MM-DD");
      const found = data.salesTrends?.find(item => item.date === selectedStr);
      setDailySales(found?.totalSales || 0);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
      messageApi.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear, token]);

  const handleDateChange = (date) => {
    if (!date) return;
    setSelectedDate(date);
    const selectedStr = date.format("YYYY-MM-DD");
    const found = salesTrends.find(item => item.date === selectedStr);
    setDailySales(found?.totalSales || 0);
  };

  const downloadPDFReport = () => {
    const doc = new jsPDF();
    const dateStr = dayjs().format("YYYY-MM-DD_HH-mm");

    const formatCurrencyForPDF = (val) => {
      if (!val) return "N0.00";
      return typeof val === "string" ? val.replace(/₦/g, "N") : `N${val.toLocaleString()}`;
    };

    doc.setFontSize(18);
    doc.text("Sales Dashboard Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Period: ${dayjs().month(selectedMonth - 1).format("MMMM")} ${selectedYear}`, 14, 30);
    doc.text(`Generated on: ${dayjs().format("lll")}`, 14, 37);

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Monthly Revenue', formatCurrencyForPDF(summary.formattedActualRevenue)],
        ['Potential Revenue', formatCurrencyForPDF(summary.formattedPotentialRevenue)],
        ['Negotiation Loss Rate', `${summary.negotiationLossRate || 0}%`],
        ['Total Transactions', summary.totalTransactions || 0],
        ['Total Area Sold', summary.formattedAreaSold || "0 sqm"],
      ],
      theme: 'striped',
      headStyles: { fill: [31, 41, 55] },
    });

    const finalY = doc.lastAutoTable.finalY;

    doc.setFontSize(14);
    doc.text("Top Selling Products", 14, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Product', 'Type', 'Size', 'Qty', 'Revenue']],
      body: topProducts.map(p => [
        p.title, 
        p.categoryType || "N/A",
        p.size || "-",
        p.totalSold, 
        formatCurrencyForPDF(p.formattedRevenue)
      ]),
      theme: 'grid',
      headStyles: { fill: [79, 70, 229] },
    });

    doc.save(`Dashboard_Report_${dateStr}.pdf`);
  };

  // UPDATED COLUMNS FOR TABLE
  const productColumns = [
    { 
        title: "Product Name", 
        dataIndex: "title", 
        key: "title",
        render: (text, record) => (
            <div>
                <div className="font-bold">{text}</div>
                <div className="text-[10px] text-gray-400 uppercase">{record.categoryType}</div>
            </div>
        )
    },
    { 
        title: "Size", 
        dataIndex: "size", 
        key: "size",
        render: (val) => <Tag color="blue">{val || "N/A"}</Tag>
    },
    { title: "Qty", dataIndex: "totalSold", key: "totalSold" },
    { 
        title: "Revenue", 
        dataIndex: "formattedRevenue", 
        key: "formattedRevenue",
        className: "text-green-600 font-semibold"
    },
  ];

  const cashierColumns = [
    { title: "Cashier", dataIndex: "name", key: "name" },
    { title: "Transactions", dataIndex: "transactions", key: "transactions" },
    { title: "Sales", dataIndex: "formattedSales", key: "formattedSales" },
    { 
        title: "Loss Rate", 
        dataIndex: "discountPercentage", 
        key: "discountPercentage",
        render: (val) => <span className="text-orange-500">{val}%</span>
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {contextHolder}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Business Overview</h1>
        <Button 
          type="primary" 
          size="large"
          className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
          onClick={downloadPDFReport}
        >
          📄 Download PDF Report
        </Button>
      </div>

      {refreshing && (
        <div className="absolute top-4 right-6 z-10">
          <Spin size="small" tip="Refreshing..." />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Monthly Revenue Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl shadow-lg p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg text-xl">💰</div>
            <div className="text-right">
              <p className="opacity-80 text-xs uppercase font-bold tracking-wider">Monthly Revenue</p>
              <h2 className="font-bold text-2xl">{summary.formattedActualRevenue || "₦0.00"}</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              size="small"
              className="w-1/2"
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={Array.from({ length: 12 }, (_, i) => ({
                value: i + 1,
                label: dayjs().month(i).format("MMMM"),
              }))}
            />
            <Select
              size="small"
              className="w-1/2"
              value={selectedYear}
              onChange={setSelectedYear}
              options={[2024, 2025, 2026].map(y => ({ value: y, label: y }))}
            />
          </div>
        </div>

        {/* Daily Sales Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl shadow-lg p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg text-xl">📅</div>
            <div className="text-right">
              <p className="opacity-80 text-xs uppercase font-bold tracking-wider">Daily Sales</p>
              <h2 className="font-bold text-2xl">₦{dailySales.toLocaleString()}</h2>
            </div>
          </div>
          <DatePicker
            size="small"
            className="w-full"
            allowClear={false}
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        {/* Potential Revenue Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-lg p-5">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg text-xl">📈</div>
            <div>
              <p className="opacity-80 text-xs uppercase font-bold">Potential Revenue</p>
              <h2 className="font-bold text-xl">{summary.formattedPotentialRevenue || "₦0.00"}</h2>
              <p className="text-[10px] bg-black/10 px-2 py-0.5 rounded inline-block mt-1">Loss Rate: {summary.negotiationLossRate}%</p>
            </div>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-5">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg text-xl">🧾</div>
            <div>
              <p className="opacity-80 text-xs uppercase font-bold">Total Sales Count</p>
              <h2 className="font-bold text-2xl">{summary.totalTransactions || 0}</h2>
              <p className="text-[10px] bg-black/10 px-2 py-0.5 rounded inline-block mt-1">Area: {summary.formattedAreaSold || "0 sqm"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Selling Products Table */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            ⭐ Top Performing Items
          </h2>
          <Table
            loading={loading}
            size="middle"
            columns={productColumns}
            dataSource={topProducts}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            className="border rounded-lg overflow-hidden"
          />
        </div>

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-bold text-gray-700 mb-4">7-Day Revenue Trend</h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrends}>
                <XAxis dataKey="date" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip 
                  formatter={(val) => `₦${val.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalSales" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#4f46e5' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashier Performance */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-700">Staff Sales Breakdown</h2>
            <Button 
              size="small"
              onClick={() => setViewChart(!viewChart)}
            >
              {viewChart ? "📊 View Table" : "📈 View Chart"}
            </Button>
          </div>
          
          {viewChart ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashierBreakdown}>
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip formatter={(val) => `₦${val.toLocaleString()}`} />
                  <Bar dataKey="totalSales" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Table
              loading={loading}
              size="small"
              columns={cashierColumns}
              dataSource={cashierBreakdown}
              rowKey="cashierId"
              pagination={{ pageSize: 5 }}
              onRow={(record) => ({
                onClick: () => navigate(`/dashboard/cashier-details/${record.cashierId}`),
                className: "cursor-pointer hover:bg-indigo-50 transition-colors"
              })}
            />
          )}
        </div>

        {/* Sales by Category Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="font-bold text-gray-700 mb-4">Inventory Category Mix</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySummary}
                  dataKey="totalSales"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  label={(entry) => entry.categoryName}
                >
                  {categorySummary.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₦${val.toLocaleString()}`} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;