const API_URL = 'https://orchestr8-backend-l6bc.onrender.com/api'

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
        const response = await fetch(`${API_URL}/track/${orderId}`)
        const data = await response.json()

        if (!response.ok) {
            return data as TrackingError
        }

        return data as TrackingInfo
    } catch (error) {
        console.error('Tracking error:', error)
        return {
            error: 'Connection error',
            message: 'Unable to connect to tracking service. Please try again.'
        }
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
        const response = await fetch(`${API_URL}/orders/${orderId}/customer-review`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, review })
        })
        return response.ok
    } catch (error) {
        console.error('Review submission error:', error)
        return false
    }
}
