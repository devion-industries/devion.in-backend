// Static NSE Company Data for Devion Demo
// This file contains mock data for 15 major NSE companies for demonstration purposes
// 
// PRODUCTION TODO: Replace with live data integration
// - Connect to NSE/BSE APIs for real-time prices
// - Implement WebSocket connections for live updates
// - Add proper error handling and fallback mechanisms
// 
// Data Sources:
// - Company descriptions: Sourced from official company websites and annual reports
// - Financial metrics: Based on publicly available data as of 2024
// - Price data: Realistic values for demonstration purposes

export interface StockData {
  symbol: string;
  name: string;
  ltp: number; // Last Traded Price
  change: number; // Percentage change
  sector: string;
  volume: number;
  // Company Fundamentals
  marketCap: string;
  peRatio: string;
  dividendYield: string;
  beta: string;
  week52High: number;
  week52Low: number;
  // Company Profile
  description: string;
}

export const mockStocks: StockData[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    ltp: 2847.65,
    change: 2.41,
    sector: "Energy",
    volume: 5234567,
    marketCap: "₹19,24,532 Cr",
    peRatio: "26.8",
    dividendYield: "0.34%",
    beta: "1.05",
    week52High: 3024.90,
    week52Low: 2220.30,
    description: "Reliance Industries Limited is India's largest private sector company, with businesses across energy, petrochemicals, oil & gas, telecom and retail. The company operates the world's largest oil refining complex and is a major player in India's digital revolution through Jio."
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    ltp: 4123.30,
    change: 2.57,
    sector: "IT",
    volume: 3456789,
    marketCap: "₹15,02,890 Cr",
    peRatio: "28.5",
    dividendYield: "3.2%",
    beta: "0.92",
    week52High: 4592.25,
    week52Low: 3311.00,
    description: "Tata Consultancy Services is a global leader in IT services, consulting & business solutions. TCS offers a consulting-led, cognitive powered, integrated portfolio of business, technology and engineering services and solutions to 46 countries."
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    ltp: 1687.20,
    change: -0.49,
    sector: "Finance",
    volume: 8901234,
    marketCap: "₹12,84,567 Cr",
    peRatio: "19.2",
    dividendYield: "1.1%",
    beta: "1.18",
    week52High: 1794.45,
    week52Low: 1363.55,
    description: "HDFC Bank Limited is India's largest private sector bank, offering a wide range of banking and financial services to corporate and retail customers through multiple products and services, along with premier client service."
  },
  {
    symbol: "INFY",
    name: "Infosys",
    ltp: 1834.50,
    change: 1.63,
    sector: "IT",
    volume: 4567890,
    marketCap: "₹7,68,234 Cr",
    peRatio: "24.1",
    dividendYield: "2.8%",
    beta: "0.89",
    week52High: 1980.15,
    week52Low: 1351.65,
    description: "Infosys Limited is a global leader in next-generation digital services and consulting. The company enables clients in more than 50 countries to navigate their digital transformation powered by cloud, artificial intelligence, automation, IoT, and analytics."
  },
  {
    symbol: "ITC",
    name: "ITC Ltd",
    ltp: 458.30,
    change: 3.50,
    sector: "FMCG",
    volume: 12345678,
    marketCap: "₹5,67,890 Cr",
    peRatio: "32.4",
    dividendYield: "4.1%",
    beta: "0.75",
    week52High: 498.95,
    week52Low: 389.45,
    description: "ITC Limited is one of India's foremost private sector companies with a diversified presence in FMCG, Hotels, Packaging, Paperboards & Specialty Papers and Agri-Business. The company is a market leader in cigarettes and has a growing FMCG portfolio."
  },
  {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever",
    ltp: 2678.90,
    change: 1.20,
    sector: "FMCG",
    volume: 2345678,
    marketCap: "₹6,28,456 Cr",
    peRatio: "58.7",
    dividendYield: "1.8%",
    beta: "0.68",
    week52High: 2844.95,
    week52Low: 2172.00,
    description: "Hindustan Unilever Limited is India's largest FMCG company with leadership in Home & Personal Care Products and Foods & Refreshments. HUL works to create a better future every day and helps people feel good, look good and get more out of life."
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel",
    ltp: 1234.50,
    change: -1.10,
    sector: "Telecom",
    volume: 6789012,
    marketCap: "₹6,98,234 Cr",
    peRatio: "45.6",
    dividendYield: "0.7%",
    beta: "0.98",
    week52High: 1349.00,
    week52Low: 883.35,
    description: "Bharti Airtel Limited is a leading global telecommunications company with operations in 18 countries across Asia and Africa. Airtel provides 2G, 3G and 4G services, mobile commerce and enterprise services including connectivity and cloud services."
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank",
    ltp: 1089.75,
    change: 0.85,
    sector: "Finance",
    volume: 7890123,
    marketCap: "₹7,56,123 Cr",
    peRatio: "16.8",
    dividendYield: "0.8%",
    beta: "1.25",
    week52High: 1257.80,
    week52Low: 874.95,
    description: "ICICI Bank Limited is India's second-largest private sector bank offering a wide range of banking products and financial services to corporate and retail customers through a variety of delivery channels and specialized subsidiaries."
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    ltp: 789.40,
    change: -0.30,
    sector: "Finance",
    volume: 9012345,
    marketCap: "₹7,04,567 Cr",
    peRatio: "12.3",
    dividendYield: "1.5%",
    beta: "1.35",
    week52High: 912.10,
    week52Low: 543.40,
    description: "State Bank of India is an Indian multinational public sector banking and financial services company. It is the largest bank in India with a 23% market share in assets and 25% share in the total loan and deposits market."
  },
  {
    symbol: "WIPRO",
    name: "Wipro Ltd",
    ltp: 567.80,
    change: 1.95,
    sector: "IT",
    volume: 3456789,
    marketCap: "₹3,12,456 Cr",
    peRatio: "22.1",
    dividendYield: "1.2%",
    beta: "0.94",
    week52High: 659.85,
    week52Low: 385.30,
    description: "Wipro Limited is a leading technology services and consulting company focused on building innovative solutions that address clients' most complex digital transformation needs. Wipro has over 250,000 employees serving clients across 66 countries."
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki",
    ltp: 12456.30,
    change: 2.10,
    sector: "Auto",
    volume: 1234567,
    marketCap: "₹3,76,234 Cr",
    peRatio: "26.7",
    dividendYield: "1.9%",
    beta: "1.12",
    week52High: 13680.00,
    week52Low: 9001.15,
    description: "Maruti Suzuki India Limited is the largest automobile manufacturer in India, manufacturing and selling popular car models like Alto, Swift, Baleno, Dzire, Vitara Brezza, Ertiga and S-Cross through its extensive sales network of over 3,000 dealers."
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors",
    ltp: 987.65,
    change: 4.20,
    sector: "Auto",
    volume: 10234567,
    marketCap: "₹3,62,890 Cr",
    peRatio: "18.9",
    dividendYield: "0.4%",
    beta: "1.68",
    week52High: 1179.05,
    week52Low: 724.60,
    description: "Tata Motors Limited is India's largest automobile company and an integral part of the Tata Group. The company's diverse portfolio includes an extensive range of cars, sports utility vehicles, buses, trucks and defense vehicles."
  },
  {
    symbol: "ADANIPORTS",
    name: "Adani Ports",
    ltp: 1345.20,
    change: -2.15,
    sector: "Infrastructure",
    volume: 4567890,
    marketCap: "₹2,89,567 Cr",
    peRatio: "21.4",
    dividendYield: "0.6%",
    beta: "1.45",
    week52High: 1607.70,
    week52Low: 754.50,
    description: "Adani Ports and Special Economic Zone Limited is the largest commercial ports operator in India accounting for nearly one-fourth of the cargo movement in the country. The company operates 13 ports and terminals on the west and east coasts of India."
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical",
    ltp: 1678.90,
    change: 0.65,
    sector: "Pharma",
    volume: 2345678,
    marketCap: "₹4,02,890 Cr",
    peRatio: "35.8",
    dividendYield: "0.3%",
    beta: "0.86",
    week52High: 1923.90,
    week52Low: 1102.05,
    description: "Sun Pharmaceutical Industries Limited is the largest pharmaceutical company in India and the world's fourth-largest specialty generic pharmaceutical company. Sun Pharma manufactures and markets pharmaceutical formulations and APIs in over 100 countries."
  },
  {
    symbol: "BAJFINANCE",
    name: "Bajaj Finance",
    ltp: 7890.40,
    change: 3.15,
    sector: "Finance",
    volume: 1456789,
    marketCap: "₹4,89,234 Cr",
    peRatio: "34.2",
    dividendYield: "0.9%",
    beta: "1.28",
    week52High: 8844.25,
    week52Low: 6187.60,
    description: "Bajaj Finance Limited is one of the most diversified NBFCs in the Indian market catering to more than 53 million customers across the country. BFL is engaged in the business of lending and acceptance of deposits. It has a significant presence in rural markets."
  }
];

// Helper function to get stock data by symbol
export const getStockBySymbol = (symbol: string): StockData | undefined => {
  return mockStocks.find(stock => stock.symbol === symbol);
};

// Helper function to get stocks by sector
export const getStocksBySector = (sector: string): StockData[] => {
  return mockStocks.filter(stock => stock.sector === sector);
};

// Get all unique sectors
export const getAllSectors = (): string[] => {
  return Array.from(new Set(mockStocks.map(stock => stock.sector)));
};
