// api/get-sheet-data.js
// This code runs on the Vercel server and is NOT visible to the client.

import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. SECURELY ACCESS THE KEY
    // This environment variable MUST be set in your Vercel project settings!
    const apiKey = process.env.GOOGLE_API_KEY;
    
    // 2. DEFINE YOUR SHEETS PARAMETERS
    // You should hardcode these values or pass them securely from the frontend (e.g., in the request body)
    const spreadsheetId = '1WWK7kqyoA_qjW3sYMo87S0Rp36ccifFPjBvuX2jQyVk'; // <-- REPLACE with your ID
    const range = 'Plot List!A2:C56'; // <-- REPLACE with your desired range
    // id status name
    
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
        return res.status(500).json({ success: false, message: 'API Key not configured securely.' });
    }

    // Construct the Google Sheets API URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

    try {
        // 3. MAKE THE API CALL WITH THE SECRET KEY
        const response = await fetch(url);

        if (!response.ok) {
            // Forward the error response details (but not the key!)
            const errorDetails = await response.json();
            return res.status(response.status).json({ 
                success: false, 
                message: 'External API Error',
                details: errorDetails
            });
        }
        
        const data = await response.json();
        const rows = data.values;
        
        // 4. PERFORM YOUR DATA PROCESSING (e.g., filtering)
        let filteredRows = [];
        if (rows && rows.length) {
            filteredRows = rows.filter((data) => {
                // Assuming data structure: [plotName, availability, name]
                const [, , name] = data; // Destructure to get the 'name' column
                if (name) return data; // Only keep rows where the third column ('name') has a value
            });
        }
        
        // 5. RETURN THE PROCESSED DATA (NOT the key) TO YOUR FRONTEND
        res.status(200).json({ 
            success: true, 
            data: filteredRows 
        });

    } catch (error) {
        console.error('Serverless Function Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}