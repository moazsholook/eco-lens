// Mock environmental data for different objects
// In production, this would come from Gemini API analysis

import type { EnvironmentalData } from '@/app/App';

const mockObjects: Record<string, Omit<EnvironmentalData, 'imageUrl'>> = {
  bottle: {
    objectName: 'Plastic Water Bottle',
    carbonFootprint: '~82.8g CO₂e',
    carbonValue: 82.8,
    lifecycle: [
      'Petroleum extraction and refinement',
      'PET plastic manufacturing',
      'Bottle formation & filling',
      'Transportation (avg. 1000 miles)',
      'Single-use disposal',
      'Landfill decomposition (450+ years)'
    ],
    explanation: 'This single-use plastic bottle has a carbon footprint of approximately 82.8 grams of CO₂ equivalent. The majority comes from petroleum extraction and plastic manufacturing. Most plastic bottles are used once and discarded, with only 23% being recycled globally. A reusable bottle breaks even after just 15 uses.',
    alternatives: [
      {
        name: 'Stainless Steel Reusable Bottle',
        benefit: 'Lasts 10+ years, eliminates single-use waste',
        carbonSavings: '95% reduction after 15 uses'
      },
      {
        name: 'Glass Water Bottle',
        benefit: 'Infinitely recyclable, no microplastics',
        carbonSavings: '90% reduction after 20 uses'
      },
      {
        name: 'Tap Water with Filter',
        benefit: 'Near-zero waste, minimal energy',
        carbonSavings: '99% reduction vs bottled water'
      }
    ]
  },
  coffee: {
    objectName: 'Disposable Coffee Cup',
    carbonFootprint: '~110g CO₂e',
    carbonValue: 110,
    lifecycle: [
      'Paper pulp production from trees',
      'Plastic lining application',
      'Cup manufacturing & printing',
      'Distribution to coffee shops',
      'Single-use consumption',
      'Disposal (rarely recycled due to plastic lining)'
    ],
    explanation: 'A disposable coffee cup produces approximately 110 grams of CO₂ equivalent per cup. The paper requires tree harvesting and energy-intensive processing, while the plastic lining makes recycling nearly impossible. Globally, 500 billion disposable cups are used annually, with less than 1% being successfully recycled.',
    alternatives: [
      {
        name: 'Ceramic Travel Mug',
        benefit: 'Reusable indefinitely, better insulation',
        carbonSavings: '90% reduction after 24 uses'
      },
      {
        name: 'Bamboo Travel Cup',
        benefit: 'Renewable material, biodegradable',
        carbonSavings: '85% reduction after 30 uses'
      },
      {
        name: 'Collapsible Silicone Cup',
        benefit: 'Portable, dishwasher safe, long-lasting',
        carbonSavings: '88% reduction after 25 uses'
      }
    ]
  },
  phone: {
    objectName: 'Smartphone',
    carbonFootprint: '~80kg CO₂e',
    carbonValue: 80000,
    lifecycle: [
      'Rare earth mining (cobalt, lithium, gold)',
      'Component manufacturing in multiple countries',
      'Assembly in factories',
      'Global shipping & distribution',
      'Consumer use phase (2-3 years)',
      'E-waste disposal or partial recycling'
    ],
    explanation: 'Manufacturing a smartphone generates approximately 80 kilograms of CO₂ equivalent, with 85% of emissions occurring before you even purchase it. Mining rare earth minerals causes significant environmental damage, and only 20% of phones are properly recycled. The average smartphone is replaced every 2.5 years, despite being functional for much longer.',
    alternatives: [
      {
        name: 'Refurbished Phone',
        benefit: 'Professionally restored, 70% less CO₂',
        carbonSavings: '70% reduction vs new phone'
      },
      {
        name: 'Keep Current Phone Longer',
        benefit: 'Each extra year saves 25kg CO₂',
        carbonSavings: '50% reduction by using 4+ years'
      },
      {
        name: 'Fairphone (Modular)',
        benefit: 'Repairable, ethical sourcing, upgradeable',
        carbonSavings: '40% reduction + circular economy'
      }
    ]
  },
  shirt: {
    objectName: 'Cotton T-Shirt',
    carbonFootprint: '~7kg CO₂e',
    carbonValue: 7000,
    lifecycle: [
      'Cotton farming (2,700L water required)',
      'Pesticide & fertilizer application',
      'Harvesting & processing',
      'Fabric dyeing & chemical treatment',
      'Garment assembly',
      'Shipping & retail',
      'Consumer use & eventual disposal'
    ],
    explanation: 'A single cotton t-shirt requires approximately 2,700 liters of water to produce and generates 7 kilograms of CO₂ equivalent. Conventional cotton farming uses 16% of the world\'s pesticides. The fashion industry is the second-largest consumer of water globally, and 85% of textiles end up in landfills each year.',
    alternatives: [
      {
        name: 'Organic Cotton T-Shirt',
        benefit: 'No pesticides, less water usage',
        carbonSavings: '45% reduction vs conventional'
      },
      {
        name: 'Recycled Polyester T-Shirt',
        benefit: 'Made from plastic bottles, diverts waste',
        carbonSavings: '55% reduction vs virgin materials'
      },
      {
        name: 'Secondhand/Thrift Shop',
        benefit: 'Near-zero new production impact',
        carbonSavings: '95% reduction vs new clothing'
      }
    ]
  },
  laptop: {
    objectName: 'Laptop Computer',
    carbonFootprint: '~200kg CO₂e',
    carbonValue: 200000,
    lifecycle: [
      'Mining rare earth elements & metals',
      'Semiconductor chip fabrication',
      'Screen & battery manufacturing',
      'Component assembly',
      'International shipping',
      'Consumer use (3-5 years)',
      'E-waste recycling or landfill'
    ],
    explanation: 'Manufacturing a laptop produces approximately 200 kilograms of CO₂ equivalent, roughly equivalent to driving 800 miles. The production phase accounts for 75% of its lifetime emissions. Laptops contain valuable materials like gold, silver, and copper, but less than 20% are properly recycled. Extending laptop lifespan is the most effective way to reduce environmental impact.',
    alternatives: [
      {
        name: 'Refurbished Business Laptop',
        benefit: 'Professional-grade, 65% less CO₂',
        carbonSavings: '65% reduction vs new laptop'
      },
      {
        name: 'Upgrade RAM/Storage',
        benefit: 'Extend current laptop lifespan',
        carbonSavings: '90% reduction vs buying new'
      },
      {
        name: 'Modular Framework Laptop',
        benefit: 'Fully repairable & upgradeable',
        carbonSavings: '50% reduction + future-proof'
      }
    ]
  }
};

// This function randomly selects an object to demonstrate variety
// In production, Gemini would identify the actual object
export function getMockEnvironmentalData(imageUrl: string): EnvironmentalData {
  const objectKeys = Object.keys(mockObjects);
  const randomKey = objectKeys[Math.floor(Math.random() * objectKeys.length)];
  const selectedObject = mockObjects[randomKey];

  return {
    ...selectedObject,
    imageUrl
  };
}

// Helper to get specific object by ID (for demo mode)
export function getSpecificMockData(objectId: string, imageUrl: string): EnvironmentalData {
  const selectedObject = mockObjects[objectId] || mockObjects.bottle;
  return {
    ...selectedObject,
    imageUrl
  };
}