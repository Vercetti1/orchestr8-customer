import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import type { Models } from 'appwrite';

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

const mapDocToTrackingInfo = async (doc: Models.Document): Promise<TrackingInfo> => {
    let riderInfo = null;
    const data = doc as any;

    if (data.riderId) {
        try {
            const riderId = typeof data.riderId === 'object' ? data.riderId.$id : data.riderId;
            const riderDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, riderId);
            riderInfo = {
                name: `${riderDoc.firstName} ${riderDoc.lastName}`,
                profileImage: riderDoc.profileImage,
                rating: riderDoc.rating || 0,
                completedTrips: riderDoc.completedTrips || 0
            };
        } catch (error) {
            console.error('Error fetching rider info:', error);
        }
    }

    return {
        trackingId: data.$id,
        status: data.status as TrackingStatus,
        pickup: data.pickup,
        dropoff: data.dropoff,
        packageDetails: {
            isFragile: data.isFragile || false,
            size: data.packageSize || 'medium',
            instructions: data.specialInstructions || ''
        },
        rider: riderInfo,
        timeline: {
            ordered: data.$createdAt,
            lastUpdate: data.$updatedAt
        },
        estimatedDelivery: data.estimatedDelivery,
        deliveryPhoto: data.deliveryPhoto,
        customerRating: data.customerRating,
        customerReview: data.customerReview
    };
};

export async function trackOrder(orderId: string): Promise<TrackingInfo | TrackingError> {
    try {
        // Try to fetch the document by ID directly
        try {
            const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.ORDERS, orderId);
            return await mapDocToTrackingInfo(doc);
        } catch (e) {
            // If ID fetch fails, try searching by a potential custom field if trackingId is different
            // But usually the $id is the tracking ID
            throw e;
        }
    } catch (error: any) {
        console.error('Tracking error:', error);
        return {
            error: 'Not found',
            message: 'Unable to find a shipment with that tracking code. Please double check the ID.'
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
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.ORDERS, orderId, {
            customerRating: rating,
            customerReview: review
        });
        return true;
    } catch (error) {
        console.error('Review submission error:', error);
        return false;
    }
}
