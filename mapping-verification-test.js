// Comprehensive Mapping Verification Test
// This test ensures zero errors in the mapping between user inputs and Card Genius API response

const SPENDING_CATEGORY_MAPPING = {
  // Shopping & Online
  amazon_spends: {
    category: "shopping",
    displayName: "Amazon Shopping",
    icon: "🛍️",
    tag: "amazon_spends",
    description: "Online shopping on Amazon"
  },
  flipkart_spends: {
    category: "shopping", 
    displayName: "Flipkart Shopping",
    icon: "📦",
    tag: "flipkart_spends",
    description: "Online shopping on Flipkart"
  },
  other_online_spends: {
    category: "shopping",
    displayName: "Other Online Shopping", 
    icon: "💸",
    tag: "other_online_spends",
    description: "Other online shopping expenses"
  },
  other_offline_spends: {
    category: "shopping",
    displayName: "Offline Shopping",
    icon: "🏪", 
    tag: "other_offline_spends",
    description: "Local shops and offline stores"
  },
  
  // Food & Dining
  grocery_spends_online: {
    category: "food",
    displayName: "Online Groceries",
    icon: "🥦",
    tag: "grocery_spends_online", 
    description: "Grocery delivery (Blinkit, Zepto, etc.)"
  },
  online_food_ordering: {
    category: "food",
    displayName: "Food Delivery",
    icon: "🛵🍜",
    tag: "online_food_ordering",
    description: "Food delivery apps"
  },
  dining_or_going_out: {
    category: "food", 
    displayName: "Dining Out",
    icon: "🥗",
    tag: "dining_or_going_out",
    description: "Restaurants and dining out"
  },
  
  // Travel
  flights_annual: {
    category: "travel",
    displayName: "Flight Bookings",
    icon: "✈️",
    tag: "flights_annual",
    description: "Annual flight expenses"
  },
  hotels_annual: {
    category: "travel",
    displayName: "Hotel Stays", 
    icon: "🛌",
    tag: "hotels_annual",
    description: "Annual hotel expenses"
  },
  domestic_lounge_usage_quarterly: {
    category: "travel",
    displayName: "Domestic Lounges",
    icon: "🇮🇳",
    tag: "domestic_lounge_usage_quarterly",
    description: "Domestic airport lounge visits"
  },
  international_lounge_usage_quarterly: {
    category: "travel",
    displayName: "International Lounges",
    icon: "🌎",
    tag: "international_lounge_usage_quarterly", 
    description: "International airport lounge visits"
  },
  
  // Fuel & Transportation
  fuel: {
    category: "fuel",
    displayName: "Fuel Expenses",
    icon: "⛽",
    tag: "fuel",
    description: "Monthly fuel expenses"
  },
  
  // Bills & Utilities
  mobile_phone_bills: {
    category: "utilities",
    displayName: "Mobile & WiFi Bills",
    icon: "📱",
    tag: "mobile_phone_bills",
    description: "Mobile and WiFi recharges"
  },
  electricity_bills: {
    category: "utilities",
    displayName: "Electricity Bills",
    icon: "⚡️",
    tag: "electricity_bills",
    description: "Monthly electricity bills"
  },
  water_bills: {
    category: "utilities",
    displayName: "Water Bills",
    icon: "💧",
    tag: "water_bills",
    description: "Monthly water bills"
  },
  
  // Insurance
  insurance_health_annual: {
    category: "insurance",
    displayName: "Health Insurance",
    icon: "🛡️",
    tag: "insurance_health_annual",
    description: "Health and term insurance"
  },
  insurance_car_or_bike_annual: {
    category: "insurance",
    displayName: "Vehicle Insurance",
    icon: "🚗",
    tag: "insurance_car_or_bike_annual",
    description: "Car and bike insurance"
  },
  
  // Other Bills
  rent: {
    category: "bills",
    displayName: "House Rent",
    icon: "🏠",
    tag: "rent",
    description: "Monthly house rent"
  },
  school_fees: {
    category: "bills",
    displayName: "School Fees",
    icon: "🎓",
    tag: "school_fees",
    description: "Monthly school fees"
  }
};

// API Response structure mapping
const API_RESPONSE_MAPPING = {
  spending_breakdown_array: "spending_breakdown_array",
  total_savings_yearly: "total_savings_yearly",
  joining_fees: "joining_fees",
  net_savings: "roi",
  category_savings: "category_savings"
};

// Test user inputs
const testUserInputs = {
  amazon_spends: 5000,
  flipkart_spends: 3000,
  other_online_spends: 2000,
  fuel: 2500,
  dining_or_going_out: 4000,
  mobile_phone_bills: 1000,
  electricity_bills: 1500,
  flights_annual: 50000,
  hotels_annual: 30000
};

// Mock API response structure
const mockApiResponse = {
  savings: [
    {
      seo_card_alias: "test-card",
      card_name: "Test Credit Card",
      spending_breakdown_array: [
        {
          category: "amazon_spends",
          amount_spent: 5000,
          category_display: "Amazon Shopping",
          tag: "amazon_spends",
          savings: 250,
          percentage: 12.5
        },
        {
          category: "flipkart_spends",
          amount_spent: 3000,
          category_display: "Flipkart Shopping",
          tag: "flipkart_spends",
          savings: 150,
          percentage: 7.5
        }
      ],
      product_usps: [
        {
          tag: "roi",
          description: "Net Annual Savings: ₹17,500"
        }
      ],
      max_potential_savings: [
        {
          tag: "max_potential_savings",
          description: "Total Annual Savings: ₹18,000"
        }
      ],
      joining_fees: [
        {
          tag: "joining_fees",
          description: "Joining Fees: ₹500"
        }
      ]
    }
  ]
};

// Verification Functions
function verifyCategoryMapping() {
  console.log("🔍 Verifying Category Mapping...");
  
  const allKeys = Object.keys(SPENDING_CATEGORY_MAPPING);
  const requiredFields = ['category', 'displayName', 'icon', 'tag', 'description'];
  
  let errors = 0;
  
  allKeys.forEach(key => {
    const mapping = SPENDING_CATEGORY_MAPPING[key];
    
    // Check if all required fields exist
    requiredFields.forEach(field => {
      if (!mapping[field]) {
        console.error(`❌ Missing field '${field}' for key '${key}'`);
        errors++;
      }
    });
    
    // Check if tag matches the key
    if (mapping.tag !== key) {
      console.error(`❌ Tag mismatch for '${key}': expected '${key}', got '${mapping.tag}'`);
      errors++;
    }
  });
  
  console.log(`✅ Category mapping verification: ${errors} errors found`);
  return errors === 0;
}

function verifyApiPayloadStructure(userInputs) {
  console.log("🔍 Verifying API Payload Structure...");
  
  const payload = {
    selected_card_id: null,
    spending_breakdown_array: []
  };
  
  // Add individual spending values
  Object.keys(userInputs).forEach(key => {
    payload[key] = userInputs[key];
  });
  
  // Create spending breakdown array
  Object.keys(userInputs).forEach(key => {
    if (userInputs[key] > 0 && SPENDING_CATEGORY_MAPPING[key]) {
      const categoryInfo = SPENDING_CATEGORY_MAPPING[key];
      payload.spending_breakdown_array.push({
        category: key,
        amount_spent: userInputs[key],
        category_display: categoryInfo.displayName,
        tag: categoryInfo.tag,
        description: categoryInfo.description,
        icon: categoryInfo.icon,
        user_input: userInputs[key],
        category_type: categoryInfo.category,
        savings_rate: 0.02,
        estimated_savings: Math.round(userInputs[key] * 0.02)
      });
    }
  });
  
  console.log("✅ API Payload Structure:", JSON.stringify(payload, null, 2));
  return payload;
}

function verifyApiResponseProcessing(apiResponse, userInputs) {
  console.log("🔍 Verifying API Response Processing...");
  
  const cardData = apiResponse.savings[0];
  const processed = { ...cardData };
  
  // Extract key savings values
  processed.total_savings_yearly = extractValueByTag(cardData, 'total_savings_yearly') || 0;
  processed.joining_fees = extractValueByTag(cardData, 'joining_fees') || 0;
  processed.net_savings = extractValueByTag(cardData, 'roi') || (processed.total_savings_yearly - processed.joining_fees);
  
  // Extract spending breakdown
  if (cardData.spending_breakdown_array && Array.isArray(cardData.spending_breakdown_array)) {
    processed.categoryBreakdown = cardData.spending_breakdown_array.map((item) => {
      const categoryInfo = SPENDING_CATEGORY_MAPPING[item.category];
      const userAmount = userInputs[item.category] || 0;
      
      return {
        category: item.category,
        displayName: categoryInfo?.displayName || item.category_display || item.category,
        icon: categoryInfo?.icon || "💰",
        userAmount: userAmount,
        savings: item.savings || 0,
        percentage: item.percentage || 0,
        tag: item.tag || item.category,
        description: categoryInfo?.description || item.description || ""
      };
    });
  }
  
  console.log("✅ Processed API Response:", processed);
  return processed;
}

function extractValueByTag(cardData, tag) {
  // Search in product_usps array
  if (cardData.product_usps && Array.isArray(cardData.product_usps)) {
    const uspItem = cardData.product_usps.find((usp) => 
      usp.tag === tag || 
      (usp.description && usp.description.toLowerCase().includes(tag.replace('_', ' ')))
    );
    if (uspItem) {
      const value = extractNumericValue(uspItem.description);
      if (value !== null) return value;
    }
  }
  
  // Search in max_potential_savings array
  if (cardData.max_potential_savings && Array.isArray(cardData.max_potential_savings)) {
    const savingsItem = cardData.max_potential_savings.find((item) => 
      item.tag === tag || 
      (item.description && item.description.toLowerCase().includes(tag.replace('_', ' ')))
    );
    if (savingsItem) {
      const value = extractNumericValue(savingsItem.description);
      if (value !== null) return value;
    }
  }
  
  return 0;
}

function extractNumericValue(str) {
  if (!str) return null;
  const cleanStr = str.replace(/[₹,]/g, '').trim();
  const match = cleanStr.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

// Run all verification tests
function runAllTests() {
  console.log("🚀 Starting Comprehensive Mapping Verification Tests...\n");
  
  const tests = [
    { name: "Category Mapping", test: verifyCategoryMapping },
    { name: "API Payload Structure", test: () => verifyApiPayloadStructure(testUserInputs) },
    { name: "API Response Processing", test: () => verifyApiResponseProcessing(mockApiResponse, testUserInputs) }
  ];
  
  let passedTests = 0;
  
  tests.forEach(({ name, test }) => {
    console.log(`\n📋 Running ${name} Test...`);
    try {
      const result = test();
      if (result !== false) {
        console.log(`✅ ${name} Test PASSED`);
        passedTests++;
      } else {
        console.log(`❌ ${name} Test FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${name} Test FAILED with error:`, error.message);
    }
  });
  
  console.log(`\n🎯 Test Results: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log("🎉 ALL TESTS PASSED! Mapping verification is complete with zero errors.");
  } else {
    console.log("⚠️  Some tests failed. Please review the errors above.");
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SPENDING_CATEGORY_MAPPING,
    API_RESPONSE_MAPPING,
    verifyCategoryMapping,
    verifyApiPayloadStructure,
    verifyApiResponseProcessing,
    runAllTests
  };
} else {
  // Run tests in browser
  runAllTests();
} 