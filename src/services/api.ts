// export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
// Using hardcoded for now or based on your environment
export const BASE_URL = 'https://orchestr8-server.onrender.com/api'; // Adjust to your actual server URL

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

export async function trackOrder(orderId: string): Promise<TrackingInfo | TrackingError> {
    try {
        const response = await fetch(`${BASE_URL}/track/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
            return {
                error: data.error || 'Not found',
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
        const response = await fetch(`${BASE_URL}/orders/${orderId}/customer-review`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating, review })
        });

        if (!response.ok) {
            const data = await response.json();
            console.error('Review submission error:', data.error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Review submission error:', error);
        return false;
    }
}
