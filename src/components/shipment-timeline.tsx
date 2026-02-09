import { motion } from 'framer-motion'
import { Package, User, Truck, CheckCircle2, XCircle } from 'lucide-react'
import type { TrackingStatus } from '@/services/api'
import { getStatusStep } from '@/services/api'
import { cn } from '@/lib/utils'

type TimelineStep = {
    label: string
    icon: typeof Package
    description: string
}

const steps: TimelineStep[] = [
    { label: 'Order Placed', icon: Package, description: 'Package received' },
    { label: 'Rider Assigned', icon: User, description: 'Rider on the way to pickup' },
    { label: 'In Transit', icon: Truck, description: 'Package en route' },
    { label: 'Delivered', icon: CheckCircle2, description: 'Successfully delivered' },
]

type ShipmentTimelineProps = {
    status: TrackingStatus
}

export function ShipmentTimeline({ status }: ShipmentTimelineProps) {
    const currentStep = getStatusStep(status)
    const isCancelled = status === 'cancelled'

    if (isCancelled) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-3 sm:space-y-4"
            >
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-500/10 flex items-center justify-center">
                    <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-red-500">Shipment Cancelled</h3>
                    <p className="opacity-50 mt-1 text-sm">This order has been cancelled</p>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="relative py-2">
            {steps.map((step, index) => {
                const isActive = index <= currentStep
                const isCurrent = index === currentStep
                const Icon = step.icon

                return (
                    <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3 sm:gap-4 mb-6 last:mb-0"
                    >
                        {/* Timeline indicator */}
                        <div className="flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                                className={cn(
                                    'h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-all duration-300',
                                    isActive && !isCurrent && 'bg-green-500 text-white',
                                    isCurrent && 'bg-purple-500 text-white shadow-lg shadow-purple-500/30',
                                    !isActive && 'border opacity-40'
                                )}
                                style={!isActive ? { borderColor: 'var(--border)', background: 'var(--background)' } : {}}
                            >
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </motion.div>
                            {index < steps.length - 1 && (
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                    className={cn(
                                        'w-0.5 h-8 sm:h-10 origin-top transition-colors duration-300',
                                        isActive ? 'bg-green-500' : ''
                                    )}
                                    style={!isActive ? { background: 'var(--border)' } : {}}
                                />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1.5 sm:pt-2">
                            <h4 className={cn(
                                'font-semibold text-sm sm:text-base',
                                !isActive && 'opacity-40'
                            )}>
                                {step.label}
                            </h4>
                            <p className="text-xs sm:text-sm opacity-50 mt-0.5">
                                {step.description}
                            </p>
                            {isCurrent && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-2 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium"
                                >
                                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-full w-full bg-purple-500"></span>
                                    </span>
                                    Current
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
