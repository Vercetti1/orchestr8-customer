import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, MapPin, AlertTriangle, Star, Truck, Box, RefreshCw } from 'lucide-react'
import { trackOrder, isTrackingError, getStatusLabel } from '@/services/api'
import type { TrackingInfo, TrackingStatus } from '@/services/api'
import { ShipmentTimeline } from '@/components/shipment-timeline'
import { cn } from '@/lib/utils'

export default function Track() {
    const [trackingCode, setTrackingCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!trackingCode.trim()) return

        setIsLoading(true)
        setError(null)
        setTrackingInfo(null)

        const result = await trackOrder(trackingCode.trim())

        if (isTrackingError(result)) {
            setError(result.message)
        } else {
            setTrackingInfo(result)
        }

        setIsLoading(false)
    }

    const handleRefresh = async () => {
        if (!trackingCode.trim()) return
        setIsLoading(true)
        const result = await trackOrder(trackingCode.trim())
        if (!isTrackingError(result)) {
            setTrackingInfo(result)
        }
        setIsLoading(false)
    }

    const getStatusColor = (status: TrackingStatus) => {
        const colors: Record<TrackingStatus, string> = {
            'pending': 'bg-zinc-500',
            'negotiating': 'bg-amber-500',
            'assigned': 'bg-blue-500',
            'in-transit': 'bg-purple-500',
            'delivered': 'bg-green-500',
            'cancelled': 'bg-red-500'
        }
        return colors[status]
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Header */}
            <header
                className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md"
                style={{ borderBottom: '1px solid var(--border)', background: 'rgba(var(--background), 0.9)' }}
            >
                <div className="font-bold tracking-widest uppercase text-sm sm:text-base">
                    Orchestr8 <span className="text-xs ml-1 opacity-60">Track</span>
                </div>
                <div className="flex items-center gap-2 text-xs opacity-60">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Shipment Tracking</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 sm:mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
                        Track Your <span className="opacity-50">Shipment</span>
                    </h1>
                    <p className="opacity-60 text-sm sm:text-base max-w-sm mx-auto">
                        Enter your tracking code to see real-time updates on your delivery
                    </p>
                </motion.div>

                {/* Search Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleTrack}
                    className="mb-8"
                >
                    <div
                        className="p-1.5 sm:p-2 flex gap-2 rounded-lg shadow-lg"
                        style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
                    >
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 opacity-40" />
                            <input
                                type="text"
                                value={trackingCode}
                                onChange={(e) => setTrackingCode(e.target.value)}
                                placeholder="Enter tracking code..."
                                className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-3 sm:pr-4 bg-transparent border-0 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded-md"
                                style={{
                                    background: 'var(--background)',
                                    color: 'var(--foreground)'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !trackingCode.trim()}
                            className={cn(
                                'h-12 sm:h-14 px-5 sm:px-8 font-semibold uppercase tracking-wide text-xs sm:text-sm transition-all duration-200 rounded-md flex items-center justify-center',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                            style={{
                                background: 'var(--foreground)',
                                color: 'var(--background)'
                            }}
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                                </motion.div>
                            ) : (
                                'Track'
                            )}
                        </button>
                    </div>
                </motion.form>

                {/* Error State */}
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 sm:p-6 flex items-start gap-3 sm:gap-4 rounded-lg border-l-4 border-red-500 mb-6"
                            style={{ background: 'var(--secondary)' }}
                        >
                            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-500 text-sm sm:text-base">Tracking Not Found</h3>
                                <p className="opacity-60 text-xs sm:text-sm mt-1">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tracking Results */}
                <AnimatePresence mode="wait">
                    {trackingInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4 sm:space-y-6"
                        >
                            {/* Status Header */}
                            <div
                                className="p-4 sm:p-6 space-y-3 rounded-lg"
                                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className={cn('h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full', getStatusColor(trackingInfo.status))} />
                                        <span className="font-bold text-lg sm:text-xl">{getStatusLabel(trackingInfo.status)}</span>
                                    </div>
                                    <button
                                        onClick={handleRefresh}
                                        disabled={isLoading}
                                        className="p-2 rounded-full transition-colors opacity-60 hover:opacity-100"
                                        title="Refresh status"
                                    >
                                        <RefreshCw className={cn('h-4 w-4 sm:h-5 sm:w-5', isLoading && 'animate-spin')} />
                                    </button>
                                </div>

                                <div className="text-xs opacity-50 font-mono">
                                    Tracking ID: {trackingInfo.trackingId}
                                </div>
                            </div>

                            {/* Locations */}
                            <div
                                className="p-4 sm:p-6 rounded-lg"
                                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
                            >
                                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <div className="text-xs uppercase tracking-wider opacity-50 font-semibold">
                                            Pickup Location
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="h-4 w-4 text-blue-500" />
                                            </div>
                                            <span className="font-medium text-sm sm:text-base">{trackingInfo.pickup}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs uppercase tracking-wider opacity-50 font-semibold">
                                            Delivery Location
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="h-4 w-4 text-green-500" />
                                            </div>
                                            <span className="font-medium text-sm sm:text-base">{trackingInfo.dropoff}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div
                                className="p-4 sm:p-6 rounded-lg"
                                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
                            >
                                <h3 className="text-xs uppercase tracking-wider opacity-50 font-semibold mb-4">
                                    Delivery Progress
                                </h3>
                                <ShipmentTimeline status={trackingInfo.status} />
                            </div>

                            {/* Rider Info */}
                            {trackingInfo.rider && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-4 sm:p-6 rounded-lg"
                                    style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
                                >
                                    <h3 className="text-xs uppercase tracking-wider opacity-50 font-semibold mb-4">
                                        Your Rider
                                    </h3>
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div
                                            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                                            style={{ background: 'var(--muted)' }}
                                        >
                                            {trackingInfo.rider.profileImage ? (
                                                <img
                                                    src={trackingInfo.rider.profileImage}
                                                    alt={trackingInfo.rider.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Truck className="h-5 w-5 sm:h-6 sm:w-6 opacity-50" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-base sm:text-lg truncate">{trackingInfo.rider.name}</div>
                                            <div className="flex items-center gap-3 sm:gap-4 mt-1 text-xs sm:text-sm opacity-60">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 fill-amber-500" />
                                                    {trackingInfo.rider.rating?.toFixed(1) || 'New'}
                                                </div>
                                                <div>{trackingInfo.rider.completedTrips || 0} trips</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Package Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-4 sm:p-6 rounded-lg"
                                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
                            >
                                <h3 className="text-xs uppercase tracking-wider opacity-50 font-semibold mb-4">
                                    Package Details
                                </h3>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    <div
                                        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm"
                                        style={{ background: 'var(--muted)' }}
                                    >
                                        <Box className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="capitalize">{trackingInfo.packageDetails.size}</span>
                                    </div>
                                    {trackingInfo.packageDetails.isFragile && (
                                        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-xs sm:text-sm">
                                            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            Fragile
                                        </div>
                                    )}
                                </div>
                                {trackingInfo.packageDetails.instructions && (
                                    <div
                                        className="mt-4 p-3 sm:p-4 rounded-lg text-xs sm:text-sm"
                                        style={{ background: 'var(--muted)' }}
                                    >
                                        <span className="opacity-60">Instructions: </span>
                                        {trackingInfo.packageDetails.instructions}
                                    </div>
                                )}
                            </motion.div>

                            {/* Timestamps */}
                            <div className="text-center text-xs opacity-50 space-y-1 py-4">
                                <div>Ordered: {new Date(trackingInfo.timeline.ordered).toLocaleString()}</div>
                                <div>Last Updated: {new Date(trackingInfo.timeline.lastUpdate).toLocaleString()}</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!trackingInfo && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center py-12 sm:py-16"
                    >
                        <div
                            className="h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--muted)' }}
                        >
                            <Package className="h-8 w-8 sm:h-10 sm:w-10 opacity-40" />
                        </div>
                        <p className="opacity-50 text-sm sm:text-base">
                            Enter your tracking code above to get started
                        </p>
                    </motion.div>
                )}
            </main>

            {/* Footer */}
            <footer
                className="py-6 sm:py-8 mt-auto"
                style={{ borderTop: '1px solid var(--border)' }}
            >
                <div className="text-center text-xs sm:text-sm opacity-50">
                    Powered by <span className="font-semibold opacity-100">Orchestr8</span>
                </div>
            </footer>
        </div>
    )
}
