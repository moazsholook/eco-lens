import { Card } from '@/app/components/ui/card';
import { Car, Plane, Home, Zap } from 'lucide-react';

interface CarbonComparisonsProps {
  carbonValue: number; // in grams CO2e
}

export function CarbonComparisons({ carbonValue }: CarbonComparisonsProps) {
  // Convert to kg for easier comparisons
  const carbonKg = carbonValue / 1000;

  // Calculate equivalents
  const comparisons = [
    {
      icon: Car,
      label: 'Driving',
      value: (carbonKg / 0.251).toFixed(1), // avg 251g CO2 per km
      unit: 'km',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Plane,
      label: 'Flying',
      value: (carbonKg / 0.255).toFixed(1), // avg 255g CO2 per km (economy)
      unit: 'km',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Zap,
      label: 'Electricity',
      value: (carbonKg / 0.475).toFixed(1), // avg 475g CO2 per kWh
      unit: 'kWh',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Home,
      label: 'Home Energy',
      value: (carbonKg / 12).toFixed(2), // avg 12kg CO2 per day
      unit: 'days',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <Card className="p-6 border-emerald-200 bg-white">
      <h3 className="font-semibold text-emerald-900 mb-4">
        Carbon Footprint Equivalents
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        This object's {carbonKg >= 1 ? `${carbonKg.toFixed(1)}kg` : `${carbonValue.toFixed(0)}g`} CO₂e is equivalent to:
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        {comparisons.map((comp, index) => {
          const Icon = comp.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className={`${comp.bgColor} p-2 rounded-lg`}>
                <Icon className={`w-5 h-5 ${comp.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">{comp.label}</p>
                <p className="text-lg font-bold text-gray-900">
                  {comp.value} <span className="text-xs font-normal text-gray-500">{comp.unit}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        Equivalents are approximate and based on global averages
      </p>
    </Card>
  );
}
