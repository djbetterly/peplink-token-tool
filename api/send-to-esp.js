export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { esp_ip, esp_page, payload } = req.body;

    if (!esp_ip || !payload) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing esp_ip or payload' 
      });
    }

    // Forward the request to the ESP device
    const espResponse = await fetch(`http://${esp_ip}/receive_tokens`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Add CORS headers in case needed
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(payload)
    });

    console.log(`ESP Response Status: ${espResponse.status}`);
    
    if (espResponse.ok) {
      const espData = await espResponse.text();
      console.log('ESP Response:', espData);
      
      return res.json({ 
        success: true, 
        message: 'Sent to ESP successfully',
        esp_response: espData
      });
    } else {
      const errorText = await espResponse.text();
      console.error('ESP Error:', errorText);
      
      return res.status(500).json({ 
        success: false, 
        message: `ESP returned error: ${espResponse.status}`,
        esp_error: errorText
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Server error: ${error.message}` 
    });
  }
}
