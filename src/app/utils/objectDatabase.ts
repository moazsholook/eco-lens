import { ObjectAnalysis } from '@/app/components/ResultsCard';

// Mock database of common objects and their environmental impact
export const objectDatabase: Record<string, ObjectAnalysis> = {
  'plastic bottle': {
    name: 'Plastic Water Bottle',
    category: 'Single-Use Plastic',
    carbonFootprint: 82,
    waterUsage: 5.5,
    recyclable: true,
    lifespanYears: 0.1,
    explanation: "This plastic bottle produces approximately 82g of CO₂ during manufacturing and transportation. It takes 3 times more water to produce than it holds. While recyclable, only 9% actually get recycled. The bottle can take up to 450 years to decompose in landfills.",
    alternatives: [
      {
        name: 'Reusable Stainless Steel Bottle',
        carbonSavings: 95,
        description: 'Breaks even after just 15 uses. Lasts for years and keeps drinks cold for 24 hours.'
      },
      {
        name: 'Glass Water Bottle',
        carbonSavings: 88,
        description: 'Chemical-free, fully recyclable, and can be reused thousands of times.'
      }
    ]
  },
  'coffee cup': {
    name: 'Disposable Coffee Cup',
    category: 'Single-Use Paper Product',
    carbonFootprint: 110,
    waterUsage: 13,
    recyclable: false,
    lifespanYears: 0.01,
    explanation: "A disposable coffee cup generates 110g of CO₂ emissions. Most cups have a plastic lining making them non-recyclable. 50 billion cups end up in landfills each year in the US alone. The production requires significant water and energy resources.",
    alternatives: [
      {
        name: 'Reusable Travel Mug',
        carbonSavings: 96,
        description: 'Pay for itself in CO₂ savings after 20 uses. Many cafes offer discounts when you bring your own.'
      },
      {
        name: 'Collapsible Silicone Cup',
        carbonSavings: 92,
        description: 'Portable, dishwasher-safe, and fits in your pocket when empty.'
      }
    ]
  },
  'laptop': {
    name: 'Laptop Computer',
    category: 'Electronics',
    carbonFootprint: 350000,
    waterUsage: 1200,
    recyclable: true,
    lifespanYears: 5,
    explanation: "Manufacturing a laptop generates approximately 350kg of CO₂ and requires 1,200 liters of water. The production involves rare earth minerals with significant environmental costs. E-waste is a growing concern, but proper recycling can recover valuable materials.",
    alternatives: [
      {
        name: 'Refurbished Laptop',
        carbonSavings: 85,
        description: 'Saves massive manufacturing emissions. Often comes with warranty and performs like new.'
      },
      {
        name: 'Extend Current Laptop Life',
        carbonSavings: 100,
        description: 'Upgrade RAM/storage, replace battery. Every extra year of use reduces annual environmental impact by 20%.'
      }
    ]
  },
  'shoes': {
    name: 'Running Shoes',
    category: 'Footwear',
    carbonFootprint: 13600,
    waterUsage: 8000,
    recyclable: false,
    lifespanYears: 1,
    explanation: "A pair of running shoes produces 13.6kg of CO₂, with most emissions from material production and manufacturing. They require 8,000 liters of water to produce. Most shoes are not recyclable and take 30-40 years to decompose.",
    alternatives: [
      {
        name: 'Recycled Material Shoes',
        carbonSavings: 65,
        description: 'Made from ocean plastic, recycled rubber, and sustainable materials. Companies like Allbirds offer take-back programs.'
      },
      {
        name: 'Resoleable Shoes',
        carbonSavings: 70,
        description: 'Built to last with replaceable soles. Brands like Vivobarefoot offer repair services.'
      }
    ]
  },
  'smartphone': {
    name: 'Smartphone',
    category: 'Electronics',
    carbonFootprint: 95000,
    waterUsage: 950,
    recyclable: true,
    lifespanYears: 3,
    explanation: "Manufacturing a smartphone generates 95kg of CO₂. It requires rare earth minerals mined under harmful conditions. The average phone is replaced every 2-3 years, but could last 5+ years with proper care. Only 12% of phones are properly recycled.",
    alternatives: [
      {
        name: 'Keep Your Phone Longer',
        carbonSavings: 80,
        description: 'Use for 4+ years instead of 2. Replace battery, use a protective case, and install software updates.'
      },
      {
        name: 'Buy Refurbished Phone',
        carbonSavings: 75,
        description: 'Certified refurbished phones work like new and cost 40-60% less. Major carriers offer warranties.'
      }
    ]
  },
  'bag': {
    name: 'Plastic Shopping Bag',
    category: 'Single-Use Plastic',
    carbonFootprint: 33,
    waterUsage: 5,
    recyclable: true,
    lifespanYears: 0.01,
    explanation: "A plastic bag produces 33g of CO₂ and is used for an average of 12 minutes before disposal. Americans use 100 billion plastic bags annually. They take 500+ years to decompose and cause significant harm to marine life.",
    alternatives: [
      {
        name: 'Reusable Cloth Bag',
        carbonSavings: 98,
        description: 'Breaks even after 4 uses. Stronger, washable, and lasts for years.'
      },
      {
        name: 'Foldable Nylon Bag',
        carbonSavings: 95,
        description: 'Fits in your pocket, holds 20kg, and replaces thousands of plastic bags.'
      }
    ]
  },
  'book': {
    name: 'Paperback Book',
    category: 'Paper Product',
    carbonFootprint: 3700,
    waterUsage: 30,
    recyclable: true,
    lifespanYears: 20,
    explanation: "A single book generates 3.7kg of CO₂ from paper production, printing, and shipping. It requires 30 liters of water to produce. While books are recyclable, they have a significant upfront environmental cost.",
    alternatives: [
      {
        name: 'E-Reader',
        carbonSavings: 65,
        description: 'Breaks even after 22-23 books read. One device holds thousands of books with minimal ongoing impact.'
      },
      {
        name: 'Library or Book Swap',
        carbonSavings: 98,
        description: 'Share resources in your community. Free, social, and eliminates production emissions entirely.'
      }
    ]
  },
  'default': {
    name: 'Everyday Object',
    category: 'Consumer Product',
    carbonFootprint: 250,
    waterUsage: 15,
    recyclable: false,
    lifespanYears: 2,
    explanation: "This object has environmental impact through its production, use, and disposal. Manufacturing requires energy and resources, creating carbon emissions and consuming water. Consider its lifecycle and how you can reduce waste.",
    alternatives: [
      {
        name: 'Buy Secondhand',
        carbonSavings: 80,
        description: 'Avoid manufacturing emissions entirely. Thrift stores, online marketplaces, and swap meets offer great options.'
      },
      {
        name: 'Rent or Borrow',
        carbonSavings: 90,
        description: 'For items used occasionally. Libraries, tool shares, and rental services reduce consumption.'
      }
    ]
  }
};

// Simple keyword matching to identify objects
export function identifyObject(imageData: string): ObjectAnalysis {
  // In a real app, this would use computer vision API
  // For demo, we'll randomly select an object or use URL simulation
  
  const objects = Object.keys(objectDatabase).filter(key => key !== 'default');
  const randomObject = objects[Math.floor(Math.random() * objects.length)];
  
  return objectDatabase[randomObject];
}
