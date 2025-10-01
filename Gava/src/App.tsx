import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Home,
  Award,
  FileText,
  MessageSquare,
  Share2,
  Wallet,
  GraduationCap,
  Download,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  ArrowRight,
  Bell,
  Moon,
  Sun,
  BarChart3,
  Shield,
  HelpCircle
} from 'lucide-react';
// Kenya flag SVG in public folder
const kenyanFlag = '/kenya-flag.svg';

// OpenCounty API integration with CORS proxy
const OPENCOUNTY_API_BASE = 'https://opencounty.org/opencounty/api/';
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

// API fetch function with CORS proxy
const fetchOpenCountyData = async (county: string, catgroup: string, category: string, year: string) => {
  try {
    const apiUrl = `${OPENCOUNTY_API_BASE}?county=${county}&catgroup=${catgroup}&category=${category}&year=${year}`;
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(apiUrl)}`;
    
    console.log(`Fetching: ${catgroup}/${category} for ${county} ${year}`);
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const proxyData = await response.json();
    
    // The proxy wraps the response in a 'contents' property
    if (proxyData.contents) {
      try {
        const data = JSON.parse(proxyData.contents);
        console.log(`✅ Successfully fetched ${catgroup}/${category}:`, data);
        return data;
      } catch (parseError) {
        console.error(`Error parsing JSON for ${catgroup}/${category}:`, parseError);
        return null;
      }
    } else {
      console.error(`No contents in proxy response for ${catgroup}/${category}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching ${catgroup}/${category} data:`, error);
    return null;
  }
};

// Format currency for display
const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `KSh ${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `KSh ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `KSh ${(amount / 1000).toFixed(1)}K`;
  }
  return `KSh ${amount.toLocaleString()}`;
};

// Calculate percentage
const calculatePercentage = (spent: number, allocated: number) => {
  if (allocated === 0) return 0;
  return Math.round((spent / allocated) * 100);
};

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // API state management
  const [selectedCounty, setSelectedCounty] = useState('Nairobi');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [budgetData, setBudgetData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [expenditureData, setExpenditureData] = useState<any>(null);
  const [sectorData, setSectorData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('fallback');
  
  // Available counties and years
  const counties = [
    'Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Kakamega', 
    'Machakos', 'Kisumu', 'Uasin Gishu', 'Kajiado', 'Meru'
  ];
  
  const years = Array.from({ length: 25 }, (_, i) => (2024 - i).toString());

  // Fetch data from OpenCounty API
  const fetchAllData = async () => {
    setLoading(true);
    console.log(`🔄 Fetching data for ${selectedCounty} County, ${selectedYear}`);
    
    try {
      // Fetch budget and expenditure data with individual error handling
      console.log('📊 Fetching budget data...');
      const budgetResult = await fetchOpenCountyData(selectedCounty, 'api_budget', 'budget', selectedYear);
      setBudgetData(budgetResult);
      
      console.log('💰 Fetching revenue data...');
      const revenueResult = await fetchOpenCountyData(selectedCounty, 'api_budget', 'revenue', selectedYear);
      setRevenueData(revenueResult);
      
      console.log('💸 Fetching expenditure data...');
      const expenditureResult = await fetchOpenCountyData(selectedCounty, 'api_budget', 'expenditure', selectedYear);
      setExpenditureData(expenditureResult);
      
      // Fetch sector data with individual error handling
      const sectors = ['Health', 'Education', 'Infrastructure', 'Agriculture', 'Water and Sanitation'];
      const sectorResults = {};
      
      console.log('🏥 Fetching sector data...');
      for (const sector of sectors) {
        console.log(`  🔍 Fetching ${sector} sector data...`);
        const sectorResult = await fetchOpenCountyData(selectedCounty, 'api_sector', sector, selectedYear);
        sectorResults[sector] = sectorResult;
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setSectorData(sectorResults);
      
      // Check if we got any real data
      const hasApiData = budgetResult || revenueResult || expenditureResult || 
                        Object.values(sectorResults).some(data => data !== null);
      
      setDataSource(hasApiData ? 'api' : 'fallback');
      console.log(`✅ All data fetching completed. Using ${hasApiData ? 'API' : 'fallback'} data.`);
      
    } catch (error) {
      console.error('❌ Error in fetchAllData:', error);
      setDataSource('fallback');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when county or year changes
  useEffect(() => {
    fetchAllData();
  }, [selectedCounty, selectedYear]);

  // Effect to initialize theme on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Helper function to safely parse data arrays
  const safeParseAmount = (item: any) => {
    const amount = parseFloat(item?.amount || item?.budget || item?.allocation || item?.expenditure || item?.spent || 0);
    return isNaN(amount) ? 0 : amount;
  };

  // Calculate totals from API data with better validation
  const calculateTotals = () => {
    let totalBudget = 0;
    let totalSpent = 0;
    
    // Calculate from budget data if available
    if (budgetData && Array.isArray(budgetData.data) && budgetData.data.length > 0) {
      totalBudget = budgetData.data.reduce((sum: number, item: any) => {
        return sum + safeParseAmount(item);
      }, 0);
      console.log(`📊 Total budget calculated: ${formatCurrency(totalBudget)}`);
    }
    
    // Calculate from expenditure data if available  
    if (expenditureData && Array.isArray(expenditureData.data) && expenditureData.data.length > 0) {
      totalSpent = expenditureData.data.reduce((sum: number, item: any) => {
        return sum + safeParseAmount(item);
      }, 0);
      console.log(`💸 Total spent calculated: ${formatCurrency(totalSpent)}`);
    }
    
    // If no API data, use fallback values
    if (totalBudget === 0 && totalSpent === 0) {
      totalBudget = 39500000000; // 39.5B fallback
      totalSpent = 34400000000;  // 34.4B fallback
      console.log('🔄 Using fallback budget values');
    }
    
    const absorptionRate = totalBudget > 0 ? calculatePercentage(totalSpent, totalBudget) : 87;
    
    return { totalBudget, totalSpent, absorptionRate };
  };

  const { totalBudget, totalSpent, absorptionRate } = calculateTotals();

  // Sample data for different pages
  const countyComparison = [
    { county: 'Nairobi', budget: 39500000000, spent: 34400000000, absorption: 87, projects: 164, rank: 1 },
    { county: 'Mombasa', budget: 18200000000, spent: 14900000000, absorption: 82, projects: 89, rank: 2 },
    { county: 'Kiambu', budget: 15800000000, spent: 12600000000, absorption: 80, projects: 76, rank: 3 },
    { county: 'Nakuru', budget: 14500000000, spent: 11300000000, absorption: 78, projects: 65, rank: 4 },
    { county: 'Kakamega', budget: 12900000000, spent: 9800000000, absorption: 76, projects: 58, rank: 5 }
  ];

  const recentProjects = [
    { id: 1, name: 'Nairobi BRT Phase 2', sector: 'Transport', budget: 2400000000, status: 'Ongoing', progress: 65, county: 'Nairobi' },
    { id: 2, name: 'Mombasa Water Treatment Plant', sector: 'Water', budget: 1800000000, status: 'Completed', progress: 100, county: 'Mombasa' },
    { id: 3, name: 'Kiambu Hospital Expansion', sector: 'Health', budget: 1200000000, status: 'Ongoing', progress: 45, county: 'Kiambu' },
    { id: 4, name: 'Nakuru Education Centers', sector: 'Education', budget: 980000000, status: 'Planning', progress: 15, county: 'Nakuru' }
  ];

  const citizenReports = [
    { id: 1, title: 'Poor Road Conditions in CBD', county: 'Nairobi', sector: 'Infrastructure', status: 'Under Review', priority: 'High', date: '2024-01-15' },
    { id: 2, title: 'Water Shortage in Eastlands', county: 'Nairobi', sector: 'Water', status: 'Resolved', priority: 'Medium', date: '2024-01-12' },
    { id: 3, title: 'School Lacks Basic Facilities', county: 'Kiambu', sector: 'Education', status: 'In Progress', priority: 'High', date: '2024-01-10' }
  ];

  const sidebarItems = [
    { id: 'dashboard', icon: Home, label: 'County Overview' },
    { id: 'leaderboard', icon: Award, label: 'Compare Counties', description: 'Top Performing Counties & Sectors' },
    { id: 'reports', icon: FileText, label: 'Project Evidence', description: 'Reports, Audits & Documents' },
    { id: 'feedback', icon: MessageSquare, label: 'Citizen Feedback', description: 'Issues & Complaints' },
    { id: 'advocacy', icon: Share2, label: 'Share & Advocate', description: 'Social Media Tools' },
    { id: 'funds', icon: Wallet, label: 'Fund Flows', description: 'Budget Accounts & Disbursements' },
    { id: 'learn', icon: GraduationCap, label: 'Budget Education', description: 'Citizen Learning Center' },
    { id: 'downloads', icon: Download, label: 'Data & API Access', description: 'Open Data Downloads' },
    { id: 'profile', icon: User, label: 'My Profile', description: 'Follow Counties & Projects' },
    { id: 'support', icon: HelpCircle, label: 'Help & Report', description: 'Support & Whistleblowing' },
    { id: 'portal', icon: Building2, label: 'Government Portal' },
    { id: 'logout', icon: LogOut, label: 'Sign Out' }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-background`}>
      {/* Fixed Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full z-50 ${sidebarHovered ? 'w-64' : 'w-16'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src={kenyanFlag} alt="Kenya Flag" className="w-full h-full object-cover" />
            </div>
            <div className={`transition-opacity duration-300 ${sidebarHovered ? 'opacity-100' : 'opacity-0'} overflow-hidden whitespace-nowrap`}>
              <h2 className="text-sidebar-foreground text-sm font-medium">GOV</h2>
              <p className="text-sidebar-foreground text-sm font-medium">TRACKER</p>
            </div>
          </div>
        </div>

        {/* Quick County Selection */}
        <div className="p-4">
          <Button className={`${sidebarHovered ? 'w-full' : 'w-8 h-8 p-0'} bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground transition-all duration-300`}>
            {sidebarHovered ? 'Select County' : <Building2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative group w-full text-left ${
                    currentPage === item.id 
                      ? 'bg-sidebar-primary/20 text-sidebar-primary' 
                      : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className={`text-sm transition-opacity duration-300 ${sidebarHovered ? 'opacity-100' : 'opacity-0'} overflow-hidden whitespace-nowrap`}>
                    {item.label}
                  </span>
                  
                  {/* Tooltip for collapsed state */}
                  {!sidebarHovered && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-border shadow-md">
                      {item.label}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`fixed top-0 right-0 bottom-0 flex flex-col transition-all duration-300 ${sidebarHovered ? 'left-64' : 'left-16'}`}>
        {/* Top Header - Fixed */}
        <header className="flex-shrink-0 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-foreground text-lg">Kenya County Budget Tracker</h1>
              <div className="flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-2 h-2 bg-[#DC143C] rounded-full animate-pulse"></div>
                    <span className="text-gray-400 text-sm">Fetching API data...</span>
                  </>
                ) : (
                  <>
                    <div className={`w-2 h-2 rounded-full ${dataSource === 'api' ? 'bg-chart-2' : 'bg-chart-1'}`}></div>
                    <span className="text-muted-foreground text-sm">
                      {dataSource === 'api' ? 'Live API data' : 'Demo data'}
                    </span>
                  </>
                )}
              </div>
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger className="w-48 bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {counties.map(county => (
                    <SelectItem key={county} value={county} className="text-popover-foreground">
                      {county} County
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24 bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {years.map(year => (
                    <SelectItem key={year} value={year} className="text-popover-foreground">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-accent text-accent-foreground">A</AvatarFallback>
                </Avatar>
                <div className="text-foreground">
                  <p className="text-sm font-medium">John Citizen</p>
                  <p className="text-xs text-muted-foreground">Nairobi Resident</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
          {currentPage === 'dashboard' && <DashboardContent />}
          {currentPage === 'leaderboard' && <CompareCountiesContent />}
          {currentPage === 'reports' && <ProjectEvidenceContent />}
          {currentPage === 'feedback' && <CitizenFeedbackContent />}
          {currentPage === 'advocacy' && <ShareAdvocateContent />}
          {currentPage === 'funds' && <FundFlowsContent />}
          {currentPage === 'learn' && <BudgetEducationContent />}
          {currentPage === 'downloads' && <DataAccessContent />}
          {currentPage === 'profile' && <MyProfileContent />}
          {currentPage === 'support' && <HelpReportContent />}
        </main>
      </div>
    </div>
  );

  // Dashboard Content Component
  function DashboardContent() {
    return (
      <>
        {/* Dashboard Content - existing content here */}
          {/* County Overview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Budget Card */}
            <Card className="bg-card border-border">
              <CardContent className="p-0 relative overflow-hidden min-h-[320px]">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 flex flex-col">
                  <div className="h-32 relative flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1605302596032-15e67c3cf66a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXNhaSUyMHRyYWRpdGlvbmFsJTIwY2xvdGhpbmclMjBrZW55YXxlbnwxfH18fDE3NTkxNzA5MDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Kenyan Traditional"
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
                  </div>
                  <div className="flex-1 bg-gradient-to-b from-background/80 to-background"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 min-h-[320px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-muted-foreground text-sm">{selectedCounty} County</p>
                      <p className="text-muted-foreground text-xs">FY {selectedYear} Budget</p>
                    </div>
                    <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                      {loading ? 'Loading...' : 'Active'}
                    </Badge>
                  </div>
                  
                  <div className="mb-4 flex-1">
                    <p className="text-muted-foreground text-sm mb-1">Total Allocated 🏛️</p>
                    <p className="text-foreground text-3xl font-bold">
                      {loading ? 'Loading...' : (totalBudget > 0 ? formatCurrency(totalBudget) : 'KSh 39.5B')}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Budget absorption rate: <span className="text-chart-2">
                        {loading ? '...' : `${absorptionRate || 87}%`}
                      </span>
                    </p>
                  </div>

                  <Button 
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={loading}
                  >
                    View Full Budget
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Budget Performance Card */}
            <Card className="bg-card border-border">
              <CardContent className="p-0 relative overflow-hidden min-h-[320px]">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 flex flex-col">
                  <div className="h-32 relative flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1711117077468-65412a92430d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBnb3Zlcm5tZW50JTIwYnVpbGRpbmclMjBrZW55YXxlbnwxfHx8fDE3NTkyNjMxNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Government Building"
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
                  </div>
                  <div className="flex-1 bg-gradient-to-b from-background/80 to-background"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 min-h-[320px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-muted-foreground text-sm">Budget Performance 📊</p>
                    <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                      {loading ? 'Loading...' : (absorptionRate >= 80 ? 'On Track' : 'Needs Attention')}
                    </Badge>
                  </div>
                  
                  <div className="mb-4 flex-1">
                    <h3 className="text-foreground text-lg font-semibold mb-1">
                      {loading ? 'Loading...' : (totalSpent > 0 ? formatCurrency(totalSpent) : 'KSh 34.4B')} Spent
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {loading ? '...' : `${absorptionRate || 87}%`} of allocated budget utilized
                    </p>
                    <div className="mt-3">
                      <Progress value={loading ? 0 : (absorptionRate || 87)} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground mr-2"
                      disabled={loading}
                    >
                      View Breakdown
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-border text-muted-foreground hover:text-foreground hover:border-chart-2"
                      disabled={loading}
                    >
                      Compare Counties
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Status Card */}
            <Card className="bg-card border-border">
              <CardContent className="p-0 relative overflow-hidden min-h-[320px]">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 flex flex-col">
                  <div className="h-32 relative flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1629471723167-0babf0b1cda1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBpbmZyYXN0cnVjdHVyZSUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc1OTI2MzE1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Infrastructure Development"
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
                  </div>
                  <div className="flex-1 bg-gradient-to-b from-background/80 to-background"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 min-h-[320px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-muted-foreground text-sm">Active Projects 🏗️</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      View All →
                    </Button>
                  </div>
                  
                  <div className="mb-4 flex-1">
                    <h3 className="text-foreground text-2xl font-bold mb-1">164 Projects</h3>
                    <p className="text-muted-foreground text-sm">
                      <span className="text-chart-2">122 Completed</span> • <span className="text-chart-1">42 Ongoing</span>
                    </p>
                    <div className="mt-3">
                      <div className="flex gap-2">
                        <div className="flex-1 bg-chart-2 h-2 rounded"></div>
                        <div className="w-8 bg-chart-1 h-2 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-foreground"
                  >
                    Track Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Budget Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Health Sector */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs mb-1">Health Sector 🏥</p>
                <p className="text-chart-2 text-lg font-bold">
                  {loading ? 'Loading...' : 
                    (sectorData.Health && Array.isArray(sectorData.Health.data) && sectorData.Health.data.length > 0
                      ? formatCurrency(sectorData.Health.data.reduce((sum: number, item: any) => 
                          sum + safeParseAmount(item), 0))
                      : 'KSh 8.5B')}
                </p>
              </CardContent>
            </Card>
            
            {/* Education */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs mb-1">Education 🎓</p>
                <p className="text-chart-2 text-lg font-bold">
                  {loading ? 'Loading...' : 
                    (sectorData.Education && Array.isArray(sectorData.Education.data) && sectorData.Education.data.length > 0
                      ? formatCurrency(sectorData.Education.data.reduce((sum: number, item: any) => 
                          sum + safeParseAmount(item), 0))
                      : 'KSh 9.2B')}
                </p>
              </CardContent>
            </Card>
            
            {/* Infrastructure */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs mb-1">Infrastructure 🏗️</p>
                <p className="text-foreground text-lg font-bold">
                  {loading ? 'Loading...' : 
                    (sectorData.Infrastructure && Array.isArray(sectorData.Infrastructure.data) && sectorData.Infrastructure.data.length > 0
                      ? formatCurrency(sectorData.Infrastructure.data.reduce((sum: number, item: any) => 
                          sum + safeParseAmount(item), 0))
                      : 'KSh 12B')}
                </p>
              </CardContent>
            </Card>
            
            {/* Agriculture */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs mb-1">Agriculture 🌾</p>
                <p className="text-foreground text-lg font-bold">
                  {loading ? 'Loading...' : 
                    (sectorData.Agriculture && Array.isArray(sectorData.Agriculture.data) && sectorData.Agriculture.data.length > 0
                      ? formatCurrency(sectorData.Agriculture.data.reduce((sum: number, item: any) => 
                          sum + safeParseAmount(item), 0))
                      : 'KSh 6.8B')}
                </p>
              </CardContent>
            </Card>
            
            {/* Water & Sanitation */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs mb-1">Water & Sanitation 💧</p>
                <p className="text-foreground text-lg font-bold">
                  {loading ? 'Loading...' : 
                    (sectorData['Water and Sanitation'] && Array.isArray(sectorData['Water and Sanitation'].data) && sectorData['Water and Sanitation'].data.length > 0
                      ? formatCurrency(sectorData['Water and Sanitation'].data.reduce((sum: number, item: any) => 
                          sum + safeParseAmount(item), 0))
                      : 'KSh 5.4B')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs mb-1">Citizen Reports 📢</p>
                <p className="text-chart-1 text-lg font-bold">247 Issues</p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sector Performance */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-muted-foreground text-sm mb-1">Budget Absorption Rate</p>
                  <p className="text-chart-2 text-2xl font-bold">
                    {loading ? '...' : `${absorptionRate || 87}%`}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {loading ? 'Loading data...' : 
                      (absorptionRate >= 82 ? 'Above national average of 82%' : 'Below national average of 82%')}
                  </p>
                </div>
                
                <div className="mb-4">
                  <p className="text-muted-foreground text-sm mb-2">Project Success Rate</p>
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${74 * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-foreground text-xl font-bold">74%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                      <span className="text-muted-foreground text-xs">122 Completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                      <span className="text-muted-foreground text-xs">42 Ongoing</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="lg:col-span-3 bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Tabs defaultValue="spending" className="w-auto">
                    <TabsList className="bg-muted border-border">
                      <TabsTrigger value="spending" className="text-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Budget vs Spending</TabsTrigger>
                      <TabsTrigger value="sectors" className="text-muted-foreground">By Sector</TabsTrigger>
                      <TabsTrigger value="projects" className="text-muted-foreground">Projects</TabsTrigger>
                      <TabsTrigger value="trends" className="text-muted-foreground">Trends</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                      <span className="text-muted-foreground text-sm">Allocated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                      <span className="text-muted-foreground text-sm">Spent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-foreground rounded-full"></div>
                      <span className="text-muted-foreground text-sm">Variance</span>
                    </div>
                    <span className="text-muted-foreground text-sm">FY 2023/24</span>
                  </div>
                </div>

                <div className="h-64">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={
                          budgetData && expenditureData ? 
                          // Process API data for chart if available
                          (() => {
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            return months.map((month, index) => ({
                              month,
                              allocated: Math.round((totalBudget / 12) * (1 + (Math.random() - 0.5) * 0.2)), // Add some variation
                              spent: Math.round((totalSpent / 12) * (1 + (Math.random() - 0.5) * 0.15)) // Add some variation
                            }));
                          })() :
                          // Fallback to original data
                          [
                            { month: 'Jan', allocated: 2400000000, spent: 2100000000 },
                            { month: 'Feb', allocated: 2800000000, spent: 2650000000 },
                            { month: 'Mar', allocated: 2600000000, spent: 2300000000 },
                            { month: 'Apr', allocated: 3200000000, spent: 2900000000 },
                            { month: 'May', allocated: 3000000000, spent: 2850000000 },
                            { month: 'Jun', allocated: 3500000000, spent: 3200000000 },
                            { month: 'Jul', allocated: 3800000000, spent: 3450000000 },
                            { month: 'Aug', allocated: 3600000000, spent: 3100000000 },
                            { month: 'Sep', allocated: 4000000000, spent: 3750000000 },
                            { month: 'Oct', allocated: 4200000000, spent: 3900000000 },
                            { month: 'Nov', allocated: 4500000000, spent: 4100000000 },
                            { month: 'Dec', allocated: 4800000000, spent: 4350000000 }
                          ]
                        }
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#006B3C" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#006B3C" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#DC143C" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#DC143C" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                        />
                        <YAxis 
                          hide 
                          domain={['dataMin - 100000000', 'dataMax + 100000000']}
                        />
                        <Area
                          type="monotone"
                          dataKey="allocated"
                          stroke="#006B3C"
                          strokeWidth={2}
                          fill="url(#budgetGradient)"
                        />
                        <Area
                          type="monotone"
                          dataKey="spent"
                          stroke="#DC143C"
                          strokeWidth={2}
                          fill="url(#spentGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-6 mt-6">
                  {/* Calculate sector percentages from API data */}
                  {(() => {
                    const getSectorPercentage = (sectorName: string) => {
                      if (!sectorData[sectorName] || !Array.isArray(sectorData[sectorName].data) || totalBudget === 0) {
                        return sectorName === 'Health' ? 21.5 : sectorName === 'Education' ? 23.3 : 30.4;
                      }
                      const sectorAmount = sectorData[sectorName].data.reduce((sum: number, item: any) => 
                        sum + safeParseAmount(item), 0);
                      return sectorAmount > 0 ? ((sectorAmount / totalBudget) * 100) : 
                        (sectorName === 'Health' ? 21.5 : sectorName === 'Education' ? 23.3 : 30.4);
                    };

                    const healthPercentage = getSectorPercentage('Health');
                    const educationPercentage = getSectorPercentage('Education');
                    const infrastructurePercentage = getSectorPercentage('Infrastructure');

                    return (
                      <>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-muted-foreground text-sm">
                              Health: {loading ? '...' : `${healthPercentage.toFixed(1)}%`}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1">
                            <div className="bg-chart-2 h-1 rounded-full" style={{width: `${healthPercentage}%`}}></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-muted-foreground text-sm">
                              Education: {loading ? '...' : `${educationPercentage.toFixed(1)}%`}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1">
                            <div className="bg-chart-1 h-1 rounded-full" style={{width: `${educationPercentage}%`}}></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-muted-foreground text-sm">
                              Infrastructure: {loading ? '...' : `${infrastructurePercentage.toFixed(1)}%`}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1">
                            <div className="bg-foreground h-1 rounded-full" style={{width: `${infrastructurePercentage}%`}}></div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Cards - Citizen Engagement & Transparency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Development Progress */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground text-sm">Development Goals 🎯</p>
                  <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                    On Track
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground text-sm">Annual Target</span>
                      <span className="text-foreground">100% Absorption</span>
                    </div>
                    <p className="text-foreground text-xl font-bold">
                      {loading ? 'Loading...' : (totalBudget > 0 ? formatCurrency(totalBudget) : 'KSh 39.5B')} Budget
                    </p>
                    <p className="text-muted-foreground text-sm">Currently utilized</p>
                    <p className="text-chart-2 text-lg font-bold">
                      {loading ? 'Loading...' : (totalSpent > 0 ? formatCurrency(totalSpent) : 'KSh 34.4B')}
                    </p>
                    <p className="text-chart-2 text-sm">
                      {loading ? '...' : `${absorptionRate || 87}%`} Achievement
                    </p>
                    <div className="mt-2">
                      <Progress value={loading ? 0 : (absorptionRate || 87)} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Citizen Engagement */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground text-sm">Citizen Engagement 👥</p>
                  <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30">
                    Active
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Reports Submitted</p>
                    <p className="text-foreground text-xl font-bold">1,247 Reports</p>
                    <p className="text-muted-foreground text-sm">This month's activity</p>
                    <p className="text-foreground text-lg font-bold">247 New Reports</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Resolved Issues</span>
                        <span className="text-chart-2">189</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Under Review</span>
                        <span className="text-foreground">58</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
      </>
    );
  }

  // Compare Counties Content
  function CompareCountiesContent() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Compare Counties</h1>
            <p className="text-muted-foreground">Performance rankings and budget comparisons across Kenya's 47 counties</p>
          </div>
          <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
            {countyComparison.length} Counties Tracked
          </Badge>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {countyComparison.slice(0, 3).map((county, index) => (
            <Card key={county.county} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-chart-1' : index === 1 ? 'bg-chart-2' : 'bg-muted'
                    }`}>
                      <span className="text-white font-bold">#{county.rank}</span>
                    </div>
                    <div>
                      <h3 className="text-foreground font-bold">{county.county} County</h3>
                      <p className="text-muted-foreground text-sm">FY {selectedYear}</p>
                    </div>
                  </div>
                  <Award className="h-5 w-5 text-chart-1" />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Budget Allocation</p>
                    <p className="text-foreground font-bold">{formatCurrency(county.budget)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Absorption Rate</p>
                    <div className="flex items-center gap-2">
                      <p className="text-chart-2 font-bold">{county.absorption}%</p>
                      <Progress value={county.absorption} className="h-2 flex-1" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs">Projects</p>
                      <p className="text-foreground font-bold">{county.projects}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Spent</p>
                      <p className="text-foreground font-bold">{formatCurrency(county.spent)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">County Performance Ranking</CardTitle>
            <p className="text-muted-foreground">Comprehensive comparison based on budget absorption, project completion, and citizen satisfaction</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground">Rank</th>
                    <th className="text-left py-3 text-muted-foreground">County</th>
                    <th className="text-left py-3 text-muted-foreground">Budget</th>
                    <th className="text-left py-3 text-muted-foreground">Spent</th>
                    <th className="text-left py-3 text-muted-foreground">Absorption</th>
                    <th className="text-left py-3 text-muted-foreground">Projects</th>
                    <th className="text-left py-3 text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {countyComparison.map((county) => (
                    <tr key={county.county} className="border-b border-border/50">
                      <td className="py-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${
                          county.rank <= 3 ? 'bg-chart-1 text-white' : 'bg-muted text-foreground'
                        }`}>
                          {county.rank}
                        </span>
                      </td>
                      <td className="py-4 text-foreground font-medium">{county.county}</td>
                      <td className="py-4 text-foreground">{formatCurrency(county.budget)}</td>
                      <td className="py-4 text-foreground">{formatCurrency(county.spent)}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-chart-2 font-bold">{county.absorption}%</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-chart-2 h-2 rounded-full" 
                              style={{width: `${county.absorption}%`}}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-foreground">{county.projects}</td>
                      <td className="py-4">
                        <Badge className={`${
                          county.absorption >= 85 ? 'bg-chart-2/20 text-chart-2 border-chart-2/30' :
                          county.absorption >= 75 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                          'bg-chart-1/20 text-chart-1 border-chart-1/30'
                        }`}>
                          {county.absorption >= 85 ? 'Excellent' : county.absorption >= 75 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Project Evidence Content
  function ProjectEvidenceContent() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Project Evidence</h1>
            <p className="text-muted-foreground">Documentation, reports, and evidence for ongoing and completed projects</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Upload Evidence
          </Button>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recentProjects.map((project) => (
            <Card key={project.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-foreground font-bold mb-1">{project.name}</h3>
                    <p className="text-muted-foreground text-sm">{project.county} County • {project.sector}</p>
                  </div>
                  <Badge className={`${
                    project.status === 'Completed' ? 'bg-chart-2/20 text-chart-2 border-chart-2/30' :
                    project.status === 'Ongoing' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {project.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Budget Allocation</p>
                    <p className="text-foreground font-bold">{formatCurrency(project.budget)}</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground text-sm">Progress</span>
                      <span className="text-foreground text-sm">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                      <FileText className="h-4 w-4 mr-1" />
                      View Documents
                    </Button>
                    <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                      <Download className="h-4 w-4 mr-1" />
                      Download Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Evidence Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-chart-2 mx-auto mb-3" />
              <h4 className="text-foreground font-bold mb-1">Project Reports</h4>
              <p className="text-muted-foreground text-sm">156 Documents</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
              <h4 className="text-foreground font-bold mb-1">Audit Reports</h4>
              <p className="text-muted-foreground text-sm">23 Audits</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-chart-2 mx-auto mb-3" />
              <h4 className="text-foreground font-bold mb-1">Financial Statements</h4>
              <p className="text-muted-foreground text-sm">89 Statements</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-accent mx-auto mb-3" />
              <h4 className="text-foreground font-bold mb-1">Citizen Feedback</h4>
              <p className="text-muted-foreground text-sm">342 Reports</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Citizen Feedback Content
  function CitizenFeedbackContent() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Citizen Feedback</h1>
            <p className="text-muted-foreground">Report issues, track complaints, and engage with your county government</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <MessageSquare className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-muted-foreground text-sm">Total Reports</p>
                  <p className="text-foreground text-2xl font-bold">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-chart-2" />
                <div>
                  <p className="text-muted-foreground text-sm">Resolved</p>
                  <p className="text-foreground text-2xl font-bold">876</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <ArrowRight className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-muted-foreground text-sm">In Progress</p>
                  <p className="text-foreground text-2xl font-bold">247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-muted-foreground text-sm">New Reports</p>
                  <p className="text-foreground text-2xl font-bold">124</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Citizen Reports</CardTitle>
            <p className="text-muted-foreground">Latest issues and complaints from citizens across {selectedCounty} County</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {citizenReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-foreground font-medium mb-1">{report.title}</h4>
                    <p className="text-muted-foreground text-sm">{report.county} County • {report.sector} • {report.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${
                      report.priority === 'High' ? 'bg-accent/20 text-accent border-accent/30' :
                      'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                    }`}>
                      {report.priority}
                    </Badge>
                    <Badge className={`${
                      report.status === 'Resolved' ? 'bg-chart-2/20 text-chart-2 border-chart-2/30' :
                      report.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                      'bg-muted text-muted-foreground border-border'
                    }`}>
                      {report.status}
                    </Badge>
                    <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Share & Advocate Content
  function ShareAdvocateContent() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Share & Advocate</h1>
            <p className="text-muted-foreground">Share budget insights, advocate for transparency, and engage your community</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Share2 className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Social Media Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-foreground font-bold mb-4">Share Budget Data</h3>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Share on Twitter
                </Button>
                <Button className="w-full bg-blue-800 hover:bg-blue-900 text-white">
                  Share on Facebook
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Share on WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-foreground font-bold mb-4">Advocacy Tools</h3>
              <div className="space-y-3">
                <Button className="w-full border border-border text-muted-foreground hover:text-foreground">
                  Create Petition
                </Button>
                <Button className="w-full border border-border text-muted-foreground hover:text-foreground">
                  Contact Your MP
                </Button>
                <Button className="w-full border border-border text-muted-foreground hover:text-foreground">
                  Join Community
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-foreground font-bold mb-4">Impact Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-sm">Shares This Month</p>
                  <p className="text-foreground text-2xl font-bold">2,847</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Active Campaigns</p>
                  <p className="text-foreground text-2xl font-bold">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Active Campaigns</CardTitle>
            <p className="text-muted-foreground">Community-driven advocacy campaigns for better governance</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-foreground font-medium mb-2">Improve Road Infrastructure in Eastlands</h4>
                <p className="text-muted-foreground text-sm mb-3">Advocating for better road conditions and drainage systems</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-chart-2">1,247 supporters</span>
                    <span className="text-muted-foreground">Started 5 days ago</span>
                  </div>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Join Campaign
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-foreground font-medium mb-2">Demand Transparency in Health Budget</h4>
                <p className="text-muted-foreground text-sm mb-3">Calling for detailed breakdown of health sector allocations</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-chart-2">892 supporters</span>
                    <span className="text-muted-foreground">Started 2 weeks ago</span>
                  </div>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Join Campaign
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fund Flows Content
  function FundFlowsContent() {
    const fundAccounts = [
      { name: 'County Revenue Fund', balance: 12500000000, inflow: 3200000000, outflow: 2800000000, status: 'Active' },
      { name: 'Development Fund', balance: 8900000000, inflow: 2100000000, outflow: 1900000000, status: 'Active' },
      { name: 'Emergency Fund', balance: 2400000000, inflow: 500000000, outflow: 300000000, status: 'Active' },
      { name: 'Reserve Fund', balance: 1800000000, inflow: 200000000, outflow: 100000000, status: 'Active' }
    ];

    const recentDisbursements = [
      { id: 1, recipient: 'Health Department', amount: 450000000, date: '2024-01-25', purpose: 'Medical Equipment Purchase', status: 'Completed' },
      { id: 2, recipient: 'Education Department', amount: 680000000, date: '2024-01-24', purpose: 'School Infrastructure', status: 'Processing' },
      { id: 3, recipient: 'Water & Sanitation', amount: 320000000, date: '2024-01-23', purpose: 'Water Pipeline Project', status: 'Completed' },
      { id: 4, recipient: 'Roads & Transport', amount: 890000000, date: '2024-01-22', purpose: 'Road Maintenance', status: 'Completed' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Fund Flows & Disbursements</h1>
            <p className="text-muted-foreground">Real-time tracking of county fund accounts and budget disbursements</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
              Live Tracking
            </Badge>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Account Overview Cards with Images */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {fundAccounts.map((account, index) => (
            <Card key={index} className="bg-card border-border overflow-hidden">
              <div className="h-24 relative">
                <img 
                  src="https://images.unsplash.com/photo-1758519291425-699343d696ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjB0cmFuc2FjdGlvbiUyMGJhbmtpbmd8ZW58MXx8fHwxNzU5MjYzOTU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Fund Account"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-xs">{account.name}</p>
                  <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30 text-xs">
                    {account.status}
                  </Badge>
                </div>
                <p className="text-foreground text-xl font-bold mb-1">{formatCurrency(account.balance)}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Inflow:</span>
                    <span className="text-chart-2">{formatCurrency(account.inflow)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Outflow:</span>
                    <span className="text-chart-1">{formatCurrency(account.outflow)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fund Flow Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Monthly Fund Flow Trends</CardTitle>
              <p className="text-muted-foreground">Track inflows and outflows across all accounts</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={[
                      { month: 'Jul', inflow: 2800000000, outflow: 2400000000 },
                      { month: 'Aug', inflow: 3100000000, outflow: 2900000000 },
                      { month: 'Sep', inflow: 2900000000, outflow: 2700000000 },
                      { month: 'Oct', inflow: 3400000000, outflow: 3100000000 },
                      { month: 'Nov', inflow: 3200000000, outflow: 2800000000 },
                      { month: 'Dec', inflow: 3600000000, outflow: 3300000000 }
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006B3C" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#006B3C" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC143C" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#DC143C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    />
                    <YAxis hide />
                    <Area
                      type="monotone"
                      dataKey="inflow"
                      stroke="#006B3C"
                      strokeWidth={2}
                      fill="url(#inflowGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="outflow"
                      stroke="#DC143C"
                      strokeWidth={2}
                      fill="url(#outflowGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                  <span className="text-muted-foreground text-sm">Inflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
                  <span className="text-muted-foreground text-sm">Outflows</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Accounts</p>
                <p className="text-foreground text-2xl font-bold">4 Accounts</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Balance</p>
                <p className="text-chart-2 text-2xl font-bold">KSh 25.6B</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">This Month</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Inflows</span>
                    <span className="text-chart-2">KSh 6.0B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Outflows</span>
                    <span className="text-chart-1">KSh 5.1B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Net Flow</span>
                    <span className="text-foreground font-bold">KSh 900M</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Disbursements */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent Disbursements</CardTitle>
                <p className="text-muted-foreground">Latest fund transfers to departments and projects</p>
              </div>
              <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                View All Transactions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground">Date</th>
                    <th className="text-left py-3 text-muted-foreground">Recipient</th>
                    <th className="text-left py-3 text-muted-foreground">Purpose</th>
                    <th className="text-left py-3 text-muted-foreground">Amount</th>
                    <th className="text-left py-3 text-muted-foreground">Status</th>
                    <th className="text-left py-3 text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDisbursements.map((disbursement) => (
                    <tr key={disbursement.id} className="border-b border-border/50">
                      <td className="py-4 text-muted-foreground">{disbursement.date}</td>
                      <td className="py-4 text-foreground font-medium">{disbursement.recipient}</td>
                      <td className="py-4 text-muted-foreground">{disbursement.purpose}</td>
                      <td className="py-4 text-foreground font-bold">{formatCurrency(disbursement.amount)}</td>
                      <td className="py-4">
                        <Badge className={`${
                          disbursement.status === 'Completed' ? 'bg-chart-2/20 text-chart-2 border-chart-2/30' :
                          'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                        }`}>
                          {disbursement.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                          Details →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function BudgetEducationContent() {
    const courses = [
      { id: 1, title: 'Introduction to County Budgets', level: 'Beginner', duration: '30 min', lessons: 5, enrolled: 1247, progress: 0 },
      { id: 2, title: 'Understanding Budget Cycles', level: 'Beginner', duration: '45 min', lessons: 7, enrolled: 892, progress: 60 },
      { id: 3, title: 'Public Participation in Budgeting', level: 'Intermediate', duration: '1 hour', lessons: 10, enrolled: 654, progress: 100 },
      { id: 4, title: 'Budget Oversight & Accountability', level: 'Advanced', duration: '1.5 hours', lessons: 12, enrolled: 423, progress: 25 }
    ];

    const glossaryTerms = [
      { term: 'Budget Allocation', definition: 'The amount of money assigned to a specific department or project for a fiscal year.' },
      { term: 'Absorption Rate', definition: 'The percentage of allocated budget that has been spent within a given period.' },
      { term: 'Fiscal Year', definition: 'A 12-month period used for accounting and budget purposes, typically July 1 to June 30 in Kenya.' },
      { term: 'Public Participation', definition: 'The process where citizens engage in budget planning and decision-making.' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Budget Education Center</h1>
            <p className="text-muted-foreground">Learn about government budgets, your rights, and how to participate effectively</p>
          </div>
          <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
            {courses.length} Courses Available
          </Badge>
        </div>

        {/* Hero Section */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1601339434203-130259102db6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBsZWFybmluZyUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NTkyMzgwODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Education"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80"></div>
            </div>
            <CardContent className="p-8 flex flex-col justify-center">
              <h2 className="text-foreground text-3xl font-bold mb-4">Empower Yourself with Budget Knowledge</h2>
              <p className="text-muted-foreground mb-6">
                Understanding your county's budget is the first step to effective civic participation. 
                Our comprehensive courses help you learn how public funds are managed and how you can make your voice heard.
              </p>
              <div className="flex gap-3">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
                <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                  Browse Courses
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-10 w-10 text-chart-2 mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">3,216</p>
              <p className="text-muted-foreground text-sm">Active Learners</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <FileText className="h-10 w-10 text-accent mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">34</p>
              <p className="text-muted-foreground text-sm">Total Lessons</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Award className="h-10 w-10 text-chart-2 mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">892</p>
              <p className="text-muted-foreground text-sm">Certificates Earned</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-10 w-10 text-accent mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">4.8</p>
              <p className="text-muted-foreground text-sm">Average Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Available Courses</CardTitle>
            <p className="text-muted-foreground">Start with beginner courses and advance to expert level</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="bg-muted border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-foreground font-bold mb-1">{course.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{course.level}</span>
                          <span>•</span>
                          <span>{course.duration}</span>
                          <span>•</span>
                          <span>{course.lessons} lessons</span>
                        </div>
                      </div>
                      <Badge className={`${
                        course.level === 'Beginner' ? 'bg-chart-2/20 text-chart-2 border-chart-2/30' :
                        course.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                        'bg-chart-1/20 text-chart-1 border-chart-1/30'
                      }`}>
                        {course.level}
                      </Badge>
                    </div>
                    
                    {course.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">{course.enrolled.toLocaleString()} enrolled</span>
                      <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        {course.progress > 0 ? 'Continue' : 'Start Course'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Glossary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Budget Glossary</CardTitle>
              <p className="text-muted-foreground">Essential terms every citizen should know</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {glossaryTerms.map((item, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <h4 className="text-foreground font-bold mb-2">{item.term}</h4>
                    <p className="text-muted-foreground text-sm">{item.definition}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 border-border text-muted-foreground hover:text-foreground">
                View Complete Glossary
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Citizen's Budget Guide
              </Button>
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <Download className="h-4 w-4 mr-2" />
                Budget Templates
              </Button>
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                FAQ & Help Center
              </Button>
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Community Forums
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function DataAccessContent() {
    const datasets = [
      { name: 'Annual County Budgets', format: 'CSV, JSON, XML', size: '45 MB', downloads: 3456, updated: '2024-01-20' },
      { name: 'Project Data & Reports', format: 'PDF, CSV', size: '128 MB', downloads: 2341, updated: '2024-01-18' },
      { name: 'Revenue Collection Data', format: 'Excel, CSV', size: '23 MB', downloads: 1876, updated: '2024-01-15' },
      { name: 'Expenditure Breakdown', format: 'CSV, JSON', size: '67 MB', downloads: 2987, updated: '2024-01-22' }
    ];

    const apiEndpoints = [
      { endpoint: '/api/budgets', method: 'GET', description: 'Retrieve budget data by county and year' },
      { endpoint: '/api/projects', method: 'GET', description: 'Get list of all projects with filters' },
      { endpoint: '/api/disbursements', method: 'GET', description: 'Access fund disbursement records' },
      { endpoint: '/api/reports', method: 'GET', description: 'Download citizen feedback reports' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Data & API Access</h1>
            <p className="text-muted-foreground">Download open government data and integrate with our public APIs</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
              Open Data Initiative
            </Badge>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="h-4 w-4 mr-2" />
              Bulk Download
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzJTIwZGFzaGJvYXJkfGVufDF8fHx8MTc1OTE3NTI4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Data Analytics"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80"></div>
            </div>
            <CardContent className="p-8 flex flex-col justify-center">
              <h2 className="text-foreground text-3xl font-bold mb-4">Transparency Through Open Data</h2>
              <p className="text-muted-foreground mb-6">
                Access comprehensive budget and expenditure data for all Kenyan counties. Download datasets in multiple formats 
                or integrate directly using our RESTful API. All data is updated in real-time and freely available.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-foreground text-2xl font-bold">10K+</p>
                  <p className="text-muted-foreground text-sm">Downloads</p>
                </div>
                <div>
                  <p className="text-foreground text-2xl font-bold">47</p>
                  <p className="text-muted-foreground text-sm">Counties</p>
                </div>
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground w-fit">
                View API Documentation
              </Button>
            </CardContent>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Download className="h-10 w-10 text-chart-2 mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">10,654</p>
              <p className="text-muted-foreground text-sm">Total Downloads</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <FileText className="h-10 w-10 text-accent mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">263 GB</p>
              <p className="text-muted-foreground text-sm">Data Available</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-10 w-10 text-chart-2 mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">12</p>
              <p className="text-muted-foreground text-sm">API Endpoints</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Shield className="h-10 w-10 text-accent mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">100%</p>
              <p className="text-muted-foreground text-sm">Open Access</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Datasets */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Available Datasets</CardTitle>
                <p className="text-muted-foreground">Download government data in multiple formats</p>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32 bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all" className="text-popover-foreground">All Formats</SelectItem>
                    <SelectItem value="csv" className="text-popover-foreground">CSV</SelectItem>
                    <SelectItem value="json" className="text-popover-foreground">JSON</SelectItem>
                    <SelectItem value="pdf" className="text-popover-foreground">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground">Dataset Name</th>
                    <th className="text-left py-3 text-muted-foreground">Format</th>
                    <th className="text-left py-3 text-muted-foreground">Size</th>
                    <th className="text-left py-3 text-muted-foreground">Downloads</th>
                    <th className="text-left py-3 text-muted-foreground">Last Updated</th>
                    <th className="text-left py-3 text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((dataset, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-4 text-foreground font-medium">{dataset.name}</td>
                      <td className="py-4 text-muted-foreground">{dataset.format}</td>
                      <td className="py-4 text-muted-foreground">{dataset.size}</td>
                      <td className="py-4 text-foreground">{dataset.downloads.toLocaleString()}</td>
                      <td className="py-4 text-muted-foreground">{dataset.updated}</td>
                      <td className="py-4">
                        <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">API Endpoints</CardTitle>
              <p className="text-muted-foreground">RESTful API for programmatic access to budget data</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((api, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30 font-mono">
                          {api.method}
                        </Badge>
                        <code className="text-foreground font-mono">{api.endpoint}</code>
                      </div>
                      <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                        Try it
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-sm">{api.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground text-sm mb-2">Example Request:</p>
                <code className="text-chart-2 text-sm font-mono block bg-background p-3 rounded">
                  GET https://api.countybudget.go.ke/api/budgets?county=Nairobi&year=2024
                </code>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Developer Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Full API Documentation
              </Button>
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <Download className="h-4 w-4 mr-2" />
                SDK Downloads
              </Button>
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Get API Key
              </Button>
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Developer Forum
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function MyProfileContent() {
    const followedCounties = [
      { name: 'Nairobi', budget: 39500000000, projects: 164, alerts: 12 },
      { name: 'Kiambu', budget: 15800000000, projects: 76, alerts: 5 },
      { name: 'Mombasa', budget: 18200000000, projects: 89, alerts: 8 }
    ];

    const savedProjects = [
      { name: 'Nairobi BRT Phase 2', county: 'Nairobi', progress: 65, status: 'Ongoing' },
      { name: 'Kiambu Hospital Expansion', county: 'Kiambu', progress: 45, status: 'Ongoing' },
      { name: 'Mombasa Water Treatment', county: 'Mombasa', progress: 100, status: 'Completed' }
    ];

    const activityLog = [
      { action: 'Submitted feedback report', item: 'Poor Road Conditions in CBD', date: '2 hours ago' },
      { action: 'Downloaded dataset', item: 'Annual County Budgets', date: '1 day ago' },
      { action: 'Joined campaign', item: 'Improve Road Infrastructure', date: '3 days ago' },
      { action: 'Completed course', item: 'Public Participation in Budgeting', date: '1 week ago' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your account, preferences, and tracked items</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="relative h-48 lg:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwcHJvZmlsZSUyMHBlcnNvbnxlbnwxfHx8fDE3NTkyNTYxMTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80"></div>
            </div>
            <CardContent className="lg:col-span-2 p-8 flex flex-col justify-center">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-accent text-accent-foreground text-2xl">JC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-foreground text-2xl font-bold mb-1">John Citizen</h2>
                  <p className="text-muted-foreground mb-4">john.citizen@email.com • Nairobi Resident</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-foreground text-xl font-bold">47</p>
                      <p className="text-muted-foreground text-sm">Reports Submitted</p>
                    </div>
                    <div className="w-px h-12 bg-border"></div>
                    <div>
                      <p className="text-foreground text-xl font-bold">3</p>
                      <p className="text-muted-foreground text-sm">Counties Followed</p>
                    </div>
                    <div className="w-px h-12 bg-border"></div>
                    <div>
                      <p className="text-foreground text-xl font-bold">12</p>
                      <p className="text-muted-foreground text-sm">Projects Saved</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Account Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-10 w-10 text-chart-2 mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">47</p>
              <p className="text-muted-foreground text-sm">Total Reports</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Award className="h-10 w-10 text-accent mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">2</p>
              <p className="text-muted-foreground text-sm">Certificates</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Download className="h-10 w-10 text-chart-2 mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">15</p>
              <p className="text-muted-foreground text-sm">Downloads</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <Share2 className="h-10 w-10 text-accent mx-auto mb-3" />
              <p className="text-foreground text-3xl font-bold mb-1">8</p>
              <p className="text-muted-foreground text-sm">Campaigns Joined</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Followed Counties */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Followed Counties</CardTitle>
                  <p className="text-muted-foreground">Counties you're tracking for budget updates</p>
                </div>
                <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                  + Add County
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followedCounties.map((county, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-foreground font-bold mb-1">{county.name} County</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Budget: {formatCurrency(county.budget)}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {county.projects} Projects
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30">
                        {county.alerts} New Alerts
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                        View →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit New Report
              </Button>
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </Button>
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
              <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Saved Projects & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Saved Projects</CardTitle>
              <p className="text-muted-foreground">Projects you're tracking</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedProjects.map((project, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-foreground font-medium mb-1">{project.name}</h4>
                        <p className="text-muted-foreground text-sm">{project.county} County</p>
                      </div>
                      <Badge className={`${
                        project.status === 'Completed' ? 'bg-chart-2/20 text-chart-2 border-chart-2/30' :
                        'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                      }`}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={project.progress} className="h-2 flex-1" />
                      <span className="text-foreground text-sm">{project.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <p className="text-muted-foreground">Your recent actions on the platform</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-chart-2 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm">{activity.action}</p>
                      <p className="text-muted-foreground text-sm">{activity.item}</p>
                      <p className="text-muted-foreground text-xs mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function HelpReportContent() {
    const faqs = [
      { 
        question: 'How do I track my county\'s budget?', 
        answer: 'Select your county from the dropdown menu in the header. You can view budget allocation, spending, and project details on the dashboard.' 
      },
      { 
        question: 'How can I report corruption or misuse of funds?', 
        answer: 'Use the "Report Corruption" section below. All reports are confidential and can be submitted anonymously for your protection.' 
      },
      { 
        question: 'How do I download budget data?', 
        answer: 'Visit the Data & API Access page to download datasets in various formats including CSV, JSON, and PDF.' 
      },
      { 
        question: 'Can I follow multiple counties?', 
        answer: 'Yes! Go to your profile page and use the "Add County" button to follow as many counties as you want.' 
      }
    ];

    const supportChannels = [
      { icon: MessageSquare, title: 'Live Chat', description: 'Chat with our support team', available: 'Mon-Fri, 8AM-6PM' },
      { icon: Bell, title: 'Email Support', description: 'support@countybudget.go.ke', available: '24/7 Response' },
      { icon: HelpCircle, title: 'Help Center', description: 'Browse articles and guides', available: 'Always Available' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Help & Support</h1>
            <p className="text-muted-foreground">Get assistance, report issues, or blow the whistle on corruption</p>
          </div>
          <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
            24/7 Support Available
          </Badge>
        </div>

        {/* Hero Section */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1632847223222-1b518ee800e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHN1cHBvcnQlMjBoZWxwfGVufDF8fHx8MTc1OTI1ODUyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Support"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80"></div>
            </div>
            <CardContent className="p-8 flex flex-col justify-center">
              <h2 className="text-foreground text-3xl font-bold mb-4">We're Here to Help</h2>
              <p className="text-muted-foreground mb-6">
                Whether you need technical assistance, want to report an issue, or have questions about budget data, 
                our team is ready to assist you. Your feedback helps us build a more transparent Kenya.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-foreground text-2xl font-bold">2,847</p>
                  <p className="text-muted-foreground text-sm">Issues Resolved</p>
                </div>
                <div>
                  <p className="text-foreground text-2xl font-bold">4.9★</p>
                  <p className="text-muted-foreground text-sm">Support Rating</p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Support Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <Card key={index} className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <Icon className="h-12 w-12 text-chart-2 mx-auto mb-4" />
                  <h3 className="text-foreground font-bold mb-2">{channel.title}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{channel.description}</p>
                  <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                    {channel.available}
                  </Badge>
                  <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                    Contact Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Report Corruption Section */}
        <Card className="bg-card border-border border-chart-1">
          <CardHeader className="bg-chart-1/10">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-chart-1" />
              <div>
                <CardTitle className="text-foreground">Report Corruption or Misuse</CardTitle>
                <p className="text-muted-foreground">Confidential whistleblowing portal - Your identity is protected</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="anonymous" className="w-full">
              <TabsList className="bg-muted border-border w-full">
                <TabsTrigger value="anonymous" className="flex-1 text-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                  Anonymous Report
                </TabsTrigger>
                <TabsTrigger value="identified" className="flex-1 text-muted-foreground">
                  Identified Report
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="anonymous" className="space-y-4 mt-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-medium mb-1">Your Protection is Guaranteed</p>
                      <p className="text-muted-foreground text-sm">
                        All reports are encrypted and anonymous. We do not track IP addresses or collect identifying information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-foreground text-sm font-medium mb-2 block">Type of Issue</label>
                    <Select>
                      <SelectTrigger className="w-full bg-input border-border text-foreground">
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="corruption" className="text-popover-foreground">Corruption</SelectItem>
                        <SelectItem value="misuse" className="text-popover-foreground">Misuse of Funds</SelectItem>
                        <SelectItem value="fraud" className="text-popover-foreground">Fraud</SelectItem>
                        <SelectItem value="bribery" className="text-popover-foreground">Bribery</SelectItem>
                        <SelectItem value="other" className="text-popover-foreground">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-foreground text-sm font-medium mb-2 block">County</label>
                    <Select>
                      <SelectTrigger className="w-full bg-input border-border text-foreground">
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {counties.map(county => (
                          <SelectItem key={county} value={county} className="text-popover-foreground">
                            {county} County
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-foreground text-sm font-medium mb-2 block">Description</label>
                    <textarea 
                      className="w-full min-h-32 p-3 bg-input border border-border rounded-lg text-foreground resize-none"
                      placeholder="Provide detailed information about the issue. Include dates, locations, amounts, and any other relevant details..."
                    />
                  </div>

                  <div>
                    <label className="text-foreground text-sm font-medium mb-2 block">Supporting Evidence (Optional)</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Download className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Click to upload documents, photos, or other evidence</p>
                      <p className="text-muted-foreground text-xs mt-1">Accepted: PDF, JPG, PNG, DOC (Max 10MB)</p>
                    </div>
                  </div>

                  <Button className="w-full bg-chart-1 hover:bg-chart-1/90 text-white">
                    <Shield className="h-4 w-4 mr-2" />
                    Submit Anonymous Report
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="identified" className="space-y-4 mt-6">
                <div className="bg-chart-2/10 border border-chart-2/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-chart-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-medium mb-1">Identified Reporting</p>
                      <p className="text-muted-foreground text-sm">
                        Providing your details may help us follow up on your report more effectively. Your information remains confidential.
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm">
                  Similar form fields with additional contact information...
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Frequently Asked Questions</CardTitle>
            <p className="text-muted-foreground">Quick answers to common questions</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <h4 className="text-foreground font-bold mb-2 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-chart-2" />
                    {faq.question}
                  </h4>
                  <p className="text-muted-foreground text-sm pl-6">{faq.answer}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 border-border text-muted-foreground hover:text-foreground">
              View All FAQs
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Emergency & Escalation Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-foreground font-bold mb-1">Ethics & Anti-Corruption Commission</p>
                <p className="text-muted-foreground text-sm">Phone: 0800 720 721</p>
                <p className="text-muted-foreground text-sm">Email: info@eacc.go.ke</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-foreground font-bold mb-1">Office of the Auditor General</p>
                <p className="text-muted-foreground text-sm">Phone: +254 20 496 0000</p>
                <p className="text-muted-foreground text-sm">Email: info@oagkenya.go.ke</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-foreground font-bold mb-1">Commission on Revenue Allocation</p>
                <p className="text-muted-foreground text-sm">Phone: +254 20 361 2937</p>
                <p className="text-muted-foreground text-sm">Email: info@crakenya.org</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}