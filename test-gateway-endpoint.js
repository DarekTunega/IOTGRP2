// Test script to check if the gateway endpoint is working
const testGatewayEndpoint = async () => {
  const testData = {
    deviceId: "303947013139353611000000",
    co2_ppm: 750,
    battery_percent: 85,
    timestamp: new Date().toISOString()
  };

  const backendUrl = "https://iotgrp2-ooor.onrender.com/api/readings/gateway";

  console.log("🧪 Testing gateway endpoint...");
  console.log("📤 Sending data:", JSON.stringify(testData, null, 2));
  console.log("🌐 URL:", backendUrl);

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log("📊 Response status:", response.status);
    console.log("📊 Response statusText:", response.statusText);

    const responseData = await response.text();
    console.log("📊 Response body:", responseData);

    if (response.ok) {
      console.log("✅ SUCCESS: Gateway endpoint is working!");
    } else {
      console.log("❌ ERROR: Gateway endpoint returned an error");
    }

  } catch (error) {
    console.error("❌ NETWORK ERROR:", error.message);
  }
};

// Run the test
testGatewayEndpoint();
