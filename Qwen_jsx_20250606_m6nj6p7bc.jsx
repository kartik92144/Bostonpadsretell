import React, { useState, useEffect } from 'react';

const App = () => {
  // State management
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [billingData, setBillingData] = useState({});
  
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalCallCharges, setTotalCallCharges] = useState(0);
  const [callDetails, setCallDetails] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const [showCallDetailsModal, setShowCallDetailsModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  const [darkMode, setDarkMode] = useState(false);

  // Generate calendar days
  const getCalendarDays = () => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    
    const days = [];
    
    // Add empty days for the days before the first of the month
    const firstDayOfWeek = firstDayOfMonth.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    
    // Add the days of the month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(selectedYear, selectedMonth, i);
      days.push({
        date,
        isCurrentMonth: true,
        isSelected: selectedDates.some(d => 
          d.getDate() === date.getDate() && 
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        )
      });
    }
    
    return days;
  };
  
  // Handle date selection
  const handleDateClick = (day) => {
    if (!day.isCurrentMonth) return;
    
    const dateIndex = selectedDates.findIndex(d => 
      d.getDate() === day.date.getDate() && 
      d.getMonth() === day.date.getMonth() &&
      d.getFullYear() === day.date.getFullYear()
    );
    
    let newSelectedDates = [...selectedDates];
    
    if (dateIndex === -1) {
      newSelectedDates.push(day.date);
    } else {
      newSelectedDates.splice(dateIndex, 1);
    }
    
    setSelectedDates(newSelectedDates);
  };
  
  // Generate mock call data
  const generateMockCalls = (startDate, endDate) => {
    const calls = [];
    const numCalls = Math.floor(Math.random() * 15) + 5; // 5-20 calls per date range
    
    for (let i = 0; i < numCalls; i++) {
      const randomMinutes = Math.floor(Math.random() * 1440); // Random time within a day
      const callDate = new Date(startDate.getTime() + randomMinutes * 60000);
      
      calls.push({
        id: Math.floor(Math.random() * 1000000),
        callerName: ["John Doe", "Jane Smith", "Alex Johnson", "Emily Davis", "Michael Brown"][Math.floor(Math.random() * 5)],
        callerNumber: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        dateTime: callDate.toISOString(),
        duration: `${Math.floor(Math.random() * 20) + 5}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        transcript: "Hi, I'm looking for a 2-bedroom apartment in downtown Boston. I need to move in by January 1st...",
        callCharges: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        appointmentBooked: Math.random() > 0.3,
        recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
        details: {
          name: ["John Doe", "Jane Smith", "Alex Johnson", "Emily Davis", "Michael Brown"][Math.floor(Math.random() * 5)],
          location: ["Boston, MA", "Cambridge, MA", "Back Bay, Boston", "Downtown Boston", "South Boston"][Math.floor(Math.random() * 5)],
          moveInDate: new Date(new Date().setMonth(new Date().getMonth() + Math.floor(Math.random() * 3) + 1)).toISOString().split('T')[0],
          email: `user${Math.floor(Math.random() * 1000)}@example.com`,
          bedrooms: Math.floor(Math.random() * 4) + 1,
          budget: `$${Math.floor(Math.random() * 2000 + 1000)}/month`,
          creditScore: Math.floor(Math.random() * 300 + 500),
          amenities: ["Gym", "Pool", "Parking", "Balcony", "Storage"].filter(() => Math.random() > 0.5),
          section8Voucher: Math.random() > 0.7,
          income: `$${Math.floor(Math.random() * 30000 + 40000)}/year`,
          movingIn: ["Myself", "Family", "Partner", "Roommates"][Math.floor(Math.random() * 4)],
          awareOfDeposits: Math.random() > 0.2,
          appointment: {
            date: new Date(new Date().setHours(new Date().getHours() + Math.floor(Math.random() * 72))).toISOString(),
            type: ["In-person", "Virtual"][Math.floor(Math.random() * 2)],
            time: ["10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"][Math.floor(Math.random() * 5)]
          },
          designPreferences: ["Modern", "Classic", "Family-friendly", "Spacious layout", "Open floor plan"][Math.floor(Math.random() * 5)]
        }
      });
    }
    
    return calls;
  };

  // Apply date range filter
  const handleApplyFilter = () => {
    if (selectedDates.length === 0) {
      // If no dates selected, generate calls for the entire month
      const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
      const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
      const calls = generateMockCalls(firstDayOfMonth, lastDayOfMonth);
      setFilteredCalls(calls);
      setTotalCalls(calls.length);
      setTotalAppointments(calls.filter(call => call.appointmentBooked).length);
      setTotalCallCharges(calls.reduce((sum, call) => sum + call.callCharges, 0));
      setCurrentPage(1);
    } else {
      const calls = selectedDates.flatMap(date => generateMockCalls(date, date));
      setFilteredCalls(calls);
      setTotalCalls(calls.length);
      setTotalAppointments(calls.filter(call => call.appointmentBooked).length);
      setTotalCallCharges(calls.reduce((sum, call) => sum + call.callCharges, 0));
      setCurrentPage(1);
    }
  };
  
  // Initialize with default data
  useEffect(() => {
    // Generate initial data for the current month
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    const initialCalls = generateMockCalls(firstDayOfMonth, lastDayOfMonth);
    
    setFilteredCalls(initialCalls);
    setTotalCalls(initialCalls.length);
    setTotalAppointments(initialCalls.filter(call => call.appointmentBooked).length);
    setTotalCallCharges(initialCalls.reduce((sum, call) => sum + call.callCharges, 0));
    
    // Generate billing data for the last 3 months
    const billing = {};
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    for (let m = 0; m < 3; m++) {
      const currentDate = new Date(now);
      currentDate.setMonth(now.getMonth() - (2 - m));
      
      const monthCalls = generateMockCalls(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      );
      
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      billing[monthKey] = monthCalls.reduce((sum, call) => sum + call.callCharges, 0);
    }
    
    setBillingData(billing);
  }, []);
  
  // Update paginated calls when filteredCalls or currentPage changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCallDetails(filteredCalls.slice(startIndex, endIndex));
  }, [filteredCalls, currentPage]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`py-4 px-6 flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors duration-200`}>
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Boston Pads</h1>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
            Voice AI Dashboard
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          <button 
            onClick={() => setShowFeedbackModal(true)}
            className={`text-sm font-medium px-3 py-1 rounded transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Leave Feedback
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`w-64 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-y-auto transition-colors duration-200`}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Calendar</h2>
            <div className="flex justify-between items-center mb-2">
              <button 
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
                className={`p-1 rounded transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="font-medium">
                {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              
              <button 
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
                className={`p-1 rounded transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`py-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{day}</div>
              ))}
              
              {getCalendarDays().map((day, index) => (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`
                    py-2 rounded-full cursor-pointer text-sm
                    transition-colors duration-200
                    ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                    ${day.isSelected 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : `hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`
                    }
                  `}
                >
                  {day.date ? day.date.getDate() : ''}
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleApplyFilter}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
            >
              Apply
            </button>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">Billing (Last 3 Months)</h2>
            <div className={`rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 transition-colors duration-200`}>
              <div className="space-y-2">
                {Object.entries(billingData)
                  .sort(([a], [b]) => {
                    const dateA = new Date(a.split('-').join('-01'));
                    const dateB = new Date(b.split('-').join('-01'));
                    return dateA - dateB;
                  })
                  .map(([monthYear, charge]) => {
                    const [year, month] = monthYear.split('-');
                    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
                    
                    return (
                      <div key={monthYear} className="flex justify-between">
                        <span>{monthName} {year}</span>
                        <span className="font-medium">{formatCurrency(charge)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Dashboard */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Calls Card */}
            <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-colors duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm uppercase font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Calls Taken
                  </p>
                  <h3 className="text-3xl font-bold mt-1">{totalCalls}</h3>
                </div>
                <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} transition-colors duration-200`}>
                  <svg className={`w-6 h-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Total Appointments Card */}
            <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-colors duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm uppercase font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Appointments Booked
                  </p>
                  <h3 className="text-3xl font-bold mt-1">{totalAppointments}</h3>
                </div>
                <div className={`p-3 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'} transition-colors duration-200`}>
                  <svg className={`w-6 h-6 ${darkMode ? 'text-green-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Call Charges Card */}
            <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-colors duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm uppercase font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Call Charges
                  </p>
                  <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalCallCharges)}</h3>
                </div>
                <div className={`p-3 rounded-full ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'} transition-colors duration-200`}>
                  <svg className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Call Details Table */}
          <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-colors duration-200`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Call Details</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-200`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Call ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Caller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Call Charges</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Appointment</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                
                <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y transition-colors duration-200`}>
                  {callDetails.length > 0 ? (
                    callDetails.map((call) => (
                      <tr key={call.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-200`}>
                        <td className="px-6 py-4 whitespace-nowrap">{call.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{call.callerName}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{call.callerNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(call.dateTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{call.duration}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(call.callCharges)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            call.appointmentBooked 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {call.appointmentBooked ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => {
                              setSelectedCall(call);
                              setShowCallDetailsModal(true);
                            }}
                            className={`text-blue-600 hover:text-blue-900 ${darkMode ? 'hover:text-blue-400' : ''} transition-colors duration-200`}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No calls found for the selected date range.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {filteredCalls.length > itemsPerPage && (
              <div className={`px-6 py-4 flex items-center justify-between border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white text-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredCalls.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(filteredCalls.length / itemsPerPage) || filteredCalls.length === 0}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white text-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredCalls.length)}</span> of{' '}
                      <span className="font-medium">{filteredCalls.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                      >
                        <span className="sr-only">First</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-10 10a2 2 0 01-2.828 0l-2-2a2 2 0 112.828-2.828L9 10.586l7.586-7.586a2 2 0 012.828 0z" />
                          <path d="M15.293 7.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L16.586 10l-1.293-1.293a1 1 0 010-1.414z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <span className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-300 bg-white text-gray-700'} transition-colors duration-200`}>
                        Page {currentPage} of {Math.ceil(filteredCalls.length / itemsPerPage)}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredCalls.length / itemsPerPage), prev + 1))}
                        disabled={currentPage === Math.ceil(filteredCalls.length / itemsPerPage) || filteredCalls.length === 0}
                        className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => setCurrentPage(Math.ceil(filteredCalls.length / itemsPerPage))}
                        disabled={currentPage === Math.ceil(filteredCalls.length / itemsPerPage) || filteredCalls.length === 0}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                      >
                        <span className="sr-only">Last</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M16.414 5.586a2 2 0 00-2.828 0L7 12.172 4.414 9.586a2 2 0 00-2.828 2.828l4 4a2 2 0 002.828 0l8-8a2 2 0 000-2.828z" />
                          <path d="M15.293 9.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L16.586 12l-1.293 1.293a1 1 0 01-1.414-1.414l2-2a1 1 0 011.414-1.414z" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Call Details Modal */}
      {showCallDetailsModal && selectedCall && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-200`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium" id="modal-title">
                      Call Details
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</p>
                          <p className="font-medium">{selectedCall.details.name}</p>
                        </div>
                        
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</p>
                          <p className="font-medium">{selectedCall.details.location}</p>
                        </div>
                        
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Move-in Date</p>
                          <p className="font-medium">{new Date(selectedCall.details.moveInDate).toLocaleDateString()}</p>
                        </div>
                        
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                          <p className="font-medium">{selectedCall.details.email}</p>
                        </div>
                        
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bedrooms Needed</p>
                          <p className="font-medium">{selectedCall.details.bedrooms}</p>
                        </div>
                        
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget</p>
                          <p className="font-medium">{selectedCall.details.budget}</p>
                        </div>
                        
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Credit Score</p>
                          <p className="font-medium">{selectedCall.details.creditScore}</p>
                        </div>
                        
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Section 8 Voucher</p>
                          <p className="font-medium">{selectedCall.details.section8Voucher ? 'Yes' : 'No'}</p>
                        </div>
                        
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Income</p>
                          <p className="font-medium">{selectedCall.details.income}</p>
                        </div>
                        
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Who is Moving In</p>
                          <p className="font-medium">{selectedCall.details.movingIn}</p>
                        </div>
                        
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aware of Deposits</p>
                          <p className="font-medium">{selectedCall.details.awareOfDeposits ? 'Yes' : 'No'}</p>
                        </div>
                        
                        <div className="col-span-2">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Appointment</p>
                          {selectedCall.appointmentBooked ? (
                            <p className="font-medium">
                              {new Date(selectedCall.details.appointment.date).toLocaleDateString()} at {selectedCall.details.appointment.time} ({selectedCall.details.appointment.type})
                            </p>
                          ) : (
                            <p className="font-medium text-gray-500">No appointment booked</p>
                          )}
                        </div>
                        
                        <div className="col-span-2">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Design Preferences</p>
                          <p className="font-medium">{selectedCall.details.designPreferences}</p>
                        </div>
                        
                        <div className="col-span-2">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Call Transcript</p>
                          <div className={`mt-2 p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors duration-200`}>
                            <p className="text-sm">{selectedCall.transcript}</p>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Call Recording</p>
                          {selectedCall.recordingUrl ? (
                            <div className={`mt-2 p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors duration-200`}>
                              <audio controls className="w-full">
                                <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          ) : (
                            <p className="mt-2 font-medium text-gray-500">No recording available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowCallDetailsModal(false)}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-200`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium" id="modal-title">
                      Leave Feedback
                    </h3>
                    
                    <div className="mt-4">
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows="4"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''} transition-colors duration-200`}
                        placeholder="Share your feedback..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackText('');
                    setShowFeedbackModal(false);
                  }}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200`}
                >
                  Send Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''} transition-colors duration-200`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;