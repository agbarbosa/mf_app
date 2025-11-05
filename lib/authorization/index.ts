// Authorization exports for easy importing
export * from './interfaces/IPermissionStrategy'
export { AuthorizationService, authorizationService } from './AuthorizationService'
export { PremiumAccessStrategy } from './strategies/PremiumAccessStrategy'
export { FreeAccessStrategy } from './strategies/FreeAccessStrategy'
export { TierBasedStrategy } from './strategies/TierBasedStrategy'
export * from './utils'
