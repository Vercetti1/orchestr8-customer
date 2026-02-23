const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '698ea85b0025d27750bf';
const TRACK_FUNCTION_ID = 'track-order';
const REVIEW_FUNCTION_ID = 'submit-review';

async function callAppwriteFunction(functionId, body) {
    const url = `${APPWRITE_ENDPOINT}/functions/${functionId}/executions`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': APPWRITE_PROJECT_ID
        },
        body: JSON.stringify({
            body: JSON.stringify(body),
            async: false
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Appwrite function error ${response.status}: ${text}`);
    }

    const execution = await response.json();
    return JSON.parse(execution.responseBody);
}

// Netlify Function handler
export async function handler(event) {
    // Set CORS headers for the response
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { action, orderId, rating, review } = JSON.parse(event.body);

        let result;

        if (action === 'track') {
            result = await callAppwriteFunction(TRACK_FUNCTION_ID, { orderId });
        } else if (action === 'review') {
            result = await callAppwriteFunction(REVIEW_FUNCTION_ID, { orderId, rating, review });
        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid action', message: 'Use action: "track" or "review"' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Proxy error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error', message: error.message })
        };
    }
}
