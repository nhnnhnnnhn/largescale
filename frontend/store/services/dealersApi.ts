import { apiSlice } from "./api"
import type { ApiResponse, BackendDealer } from "@/types/api"

export const dealersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDealers: builder.query<ApiResponse<BackendDealer[]>, void>({
            query: () => "/dealers",
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ dealer_id }) => ({
                            type: "Dealers" as const,
                            id: dealer_id,
                        })),
                        { type: "Dealers", id: "LIST" },
                    ]
                    : [{ type: "Dealers", id: "LIST" }],
        }),

        getDealerById: builder.query<ApiResponse<BackendDealer>, string>({
            query: (id) => `/dealers/${id}`,
            providesTags: (result, error, id) => [{ type: "Dealers", id }],
        }),

        getDealerInventory: builder.query<
            ApiResponse<any>,
            { id: string; page?: number; limit?: number }
        >({
            query: ({ id, page = 1, limit = 20 }) => ({
                url: `/dealers/${id}/inventory`,
                params: { page, limit },
            }),
            providesTags: (result, error, { id }) => [{ type: "Dealers", id }],
        }),

        getNearbyDealers: builder.query<
            ApiResponse<BackendDealer[]>,
            { latitude: number; longitude: number; maxDistance?: number }
        >({
            query: ({ latitude, longitude, maxDistance = 50000 }) => ({
                url: "/dealers/nearby",
                params: { latitude, longitude, maxDistance },
            }),
            providesTags: [{ type: "Dealers", id: "NEARBY" }],
        }),

        getDealersStats: builder.query<
            ApiResponse<Record<string, { total_cars: number; avg_price: number }>>,
            void
        >({
            query: () => "/dealers/stats",
            providesTags: [{ type: "Dealers", id: "STATS" }],
        }),
    }),
})

export const {
    useGetDealersQuery,
    useGetDealerByIdQuery,
    useGetDealerInventoryQuery,
    useGetNearbyDealersQuery,
    useGetDealersStatsQuery,
} = dealersApi
