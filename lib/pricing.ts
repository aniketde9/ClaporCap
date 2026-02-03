/**
 * Pricing Calculation Library
 * 
 * Calculates estimated costs for feedback collection based on:
 * - Duration (minutes/hours/days)
 * - Estimated response rate
 * - Cost per response
 */

export interface PricingConfig {
    base_cost: number; // Base cost for posting
    per_response_cost: number; // Cost per agent response
    estimated_responses_per_minute: number; // Estimated agents responding per minute
}

// Default pricing (update based on actual Moltbook pricing)
const DEFAULT_PRICING: PricingConfig = {
    base_cost: 0.10, // $0.10 base cost
    per_response_cost: 0.01, // $0.01 per response
    estimated_responses_per_minute: 2 // 2 agents respond per minute on average
};

/**
 * Calculate estimated cost for feedback collection
 */
export function calculateEstimatedCost(
    durationMinutes: number,
    config: PricingConfig = DEFAULT_PRICING
): number {
    const estimatedResponses = durationMinutes * config.estimated_responses_per_minute;
    const totalCost = config.base_cost + (estimatedResponses * config.per_response_cost);
    
    // Round to 2 decimal places
    return Math.round(totalCost * 100) / 100;
}

/**
 * Convert duration from different units to minutes
 */
export function convertToMinutes(
    duration: number,
    unit: 'minutes' | 'hours' | 'days'
): number {
    switch (unit) {
        case 'minutes':
            return duration;
        case 'hours':
            return duration * 60;
        case 'days':
            return duration * 60 * 24;
        default:
            return duration;
    }
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
    return `$${cost.toFixed(2)}`;
}

/**
 * Get pricing breakdown for display
 */
export function getPricingBreakdown(
    durationMinutes: number,
    config: PricingConfig = DEFAULT_PRICING
): {
    baseCost: number;
    estimatedResponses: number;
    responseCost: number;
    totalCost: number;
} {
    const estimatedResponses = Math.round(durationMinutes * config.estimated_responses_per_minute);
    const responseCost = estimatedResponses * config.per_response_cost;
    const totalCost = config.base_cost + responseCost;
    
    return {
        baseCost: config.base_cost,
        estimatedResponses,
        responseCost: Math.round(responseCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100
    };
}
