import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export const LiveIndicator = () => {
  const [priceAge, setPriceAge] = useState(0);
  const [isMarketOpen, setIsMarketOpen] = useState(true);

  useEffect(() => {
    // Simulate price age incrementing
    const interval = setInterval(() => {
      setPriceAge((prev) => (prev + 1) % 5);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!isMarketOpen) return "warning";
    if (priceAge > 4) return "warning";
    return "success";
  };

  const getStatusText = () => {
    if (!isMarketOpen) return "Market Closed";
    return `Live • ${priceAge}s`;
  };

  return (
    <Badge 
      variant="outline" 
      className={`gap-2 ${
        getStatusColor() === "success" 
          ? "border-success/50 text-success" 
          : "border-warning/50 text-warning"
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${
        getStatusColor() === "success" ? "bg-success" : "bg-warning"
      } ${isMarketOpen && "animate-pulse"}`} />
      {getStatusText()}
    </Badge>
  );
};
