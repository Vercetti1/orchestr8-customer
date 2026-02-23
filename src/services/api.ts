// Appwrite Function execution config
// Replace these with your actual Appwrite values or use env vars
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '698ea85b0025d27750bf';

// Function IDs — set these to the IDs from your Appwrite Console after deploying
const TRACK_ORDER_FUNCTION_ID = import.meta.env.VITE_TRACK_ORDER_FUNCTION_ID || 'track-order';
const SUBMIT_REVIEW_FUNCTION_ID = import.meta.env.VITE_SUBMIT_REVIEW_FUNCTION_ID || 'submit-review';

export type TrackingStatus = 'pending' | 'negotiating' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled'

export type TrackingInfo = {
    trackingId: string
    status: TrackingStatus
    pickup: string
    dropoff: string
    packageDetails: {
        isFragile: boolean
        size: 'small' | 'medium' | 'large'
        instructions: string
    }
    rider: {
        name: string
        profileImage?: string
        rating: number
        completedTrips: number
    } | null
    timeline: {
        ordered: string
        lastUpdate: string
    }
    estimatedDelivery?: string
    deliveryPhoto?: string
    customerRating?: number
    customerReview?: string
}

export type TrackingError = {
    error: string
    message: string
}

/**
 * Execute an Appwrite Function via the REST API.
 * This bypasses the platform/CORS limit because function execution
 * endpoints don't require a registered platform.
 */
async function executeFunction(functionId: string, body: Record<string, unknown>): Promise<any> {
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
        throw new Error(`Function execution failed: ${response.status}`);
    }

    const execution = await response.json();

    // The function response is in execution.responseBody (string)
    try {
        return JSON.parse(execution.responseBody);
    } catch {
        throw new Error('Invalid response from function');
    }
}

export async function trackOrder(orderId: string): Promise<TrackingInfo | TrackingError> {
    try {
        const data = await executeFunction(TRACK_ORDER_FUNCTION_ID, { orderId });

        // If the function returned an error shape
        if (data.error) {
            return {
                error: data.error,
                message: data.message || 'Unable to find a shipment with that tracking code.'
            };
        }

        return data as TrackingInfo;
    } catch (error) {
        console.error('Tracking error:', error);
        return {
            error: 'Connection error',
            message: 'Unable to connect to the tracking server. Please try again later.'
        };
    }
}

export function isTrackingError(result: TrackingInfo | TrackingError): result is TrackingError {
    return 'error' in result
}

export function getStatusLabel(status: TrackingStatus): string {
    const labels: Record<TrackingStatus, string> = {
        'pending': 'Order Placed',
        'negotiating': 'Finding Rider',
        'assigned': 'Rider Assigned',
        'in-transit': 'In Transit',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    }
    return labels[status]
}

export function getStatusStep(status: TrackingStatus): number {
    const steps: Record<TrackingStatus, number> = {
        'pending': 0,
        'negotiating': 0,
        'assigned': 1,
        'in-transit': 2,
        'delivered': 3,
        'cancelled': -1
    }
    return steps[status]
}

export async function submitReview(orderId: string, rating: number, review?: string): Promise<boolean> {
    try {
        const data = await executeFunction(SUBMIT_REVIEW_FUNCTION_ID, { orderId, rating, review });

        if (!data.success) {
            console.error('Review submission error:', data.error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Review submission error:', error);
        return false;
    }
}
