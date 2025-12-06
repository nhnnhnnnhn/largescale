import { apiSlice } from "./api"
import type {
    ApiResponse,
    AnalyticsOverview,
    ManufacturerStats,
    FuelTypeStats,
    ServiceTrend,
    AccidentTrend,
    AccidentSeverityStats,
    MileagePriceData,
    PriceDistribution,
    TopDealer,
} from "@/types/api"

export const analyticsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getOverview: builder.query<ApiResponse<AnalyticsOverview>, void>({
            query: () => "/analytics/overview",
            providesTags: [{ type: "Analytics", id: "OVERVIEW" }],
        }),

        getByManufacturer: builder.query<ApiResponse<ManufacturerStats[]>, void>({
            query: () => "/analytics/by-manufacturer",
            providesTags: [{ type: "Analytics", id: "MANUFACTURER" }],
        }),

        getByFuelType: builder.query<ApiResponse<FuelTypeStats[]>, void>({
            query: () => "/analytics/by-fuel-type",
            providesTags: [{ type: "Analytics", id: "FUEL_TYPE" }],
        }),

        getServiceTrends: builder.query<ApiResponse<ServiceTrend[]>, { months?: number }>({
            query: ({ months = 24 }) => ({
                url: "/analytics/service-trends",
                params: { months },
            }),
            providesTags: [{ type: "Analytics", id: "SERVICE_TRENDS" }],
        }),

        getAccidentTrends: builder.query<ApiResponse<AccidentTrend[]>, { months?: number }>({
            query: ({ months = 24 }) => ({
                url: "/analytics/accident-trends",
                params: { months },
            }),
            providesTags: [{ type: "Analytics", id: "ACCIDENT_TRENDS" }],
        }),

        getAccidentSeverity: builder.query<ApiResponse<AccidentSeverityStats[]>, void>({
            query: () => "/analytics/accident-severity",
            providesTags: [{ type: "Analytics", id: "ACCIDENT_SEVERITY" }],
        }),

        getMileagePrice: builder.query<ApiResponse<MileagePriceData[]>, { limit?: number }>({
            query: ({ limit = 1000 }) => ({
                url: "/analytics/mileage-price",
                params: { limit },
            }),
            providesTags: [{ type: "Analytics", id: "MILEAGE_PRICE" }],
        }),

        getPriceDistribution: builder.query<ApiResponse<PriceDistribution[]>, { bins?: number }>({
            query: ({ bins = 10 }) => ({
                url: "/analytics/price-distribution",
                params: { bins },
            }),
            providesTags: [{ type: "Analytics", id: "PRICE_DISTRIBUTION" }],
        }),

        getTopDealers: builder.query<ApiResponse<TopDealer[]>, { limit?: number }>({
            query: ({ limit = 10 }) => ({
                url: "/analytics/top-dealers",
                params: { limit },
            }),
            providesTags: [{ type: "Analytics", id: "TOP_DEALERS" }],
        }),
    }),
})

export const {
    useGetOverviewQuery,
    useGetByManufacturerQuery,
    useGetByFuelTypeQuery,
    useGetServiceTrendsQuery,
    useGetAccidentTrendsQuery,
    useGetAccidentSeverityQuery,
    useGetMileagePriceQuery,
    useGetPriceDistributionQuery,
    useGetTopDealersQuery,
} = analyticsApi
