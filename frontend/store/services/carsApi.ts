import { apiSlice } from "./api"
import type {
    ApiResponse,
    ApiListResponse,
    BackendCar,
    BackendCarHistory,
    SearchCarsRequest,
} from "@/types/api"

export const carsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCars: builder.query<
            ApiListResponse<BackendCar>,
            { page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }
        >({
            query: ({ page = 1, limit = 20, sort = "car_id", order = "asc" }) => ({
                url: "/cars",
                params: { page, limit, sort, order },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ car_id }) => ({
                            type: "Cars" as const,
                            id: car_id,
                        })),
                        { type: "Cars", id: "LIST" },
                    ]
                    : [{ type: "Cars", id: "LIST" }],
        }),

        getCarById: builder.query<ApiResponse<BackendCar>, string>({
            query: (id) => `/cars/${id}`,
            providesTags: (result, error, id) => [{ type: "Cars", id }],
        }),

        searchCars: builder.mutation<
            ApiListResponse<BackendCar>,
            {
                filters: SearchCarsRequest
                page?: number
                limit?: number
            }
        >({
            query: ({ filters, page = 1, limit = 20 }) => ({
                url: `/cars/search?page=${page}&limit=${limit}`,
                method: "POST",
                body: filters,
            }),
            invalidatesTags: [{ type: "Cars", id: "LIST" }],
        }),

        getCarHistory: builder.query<ApiResponse<BackendCarHistory>, string>({
            query: (id) => `/cars/${id}/history`,
            providesTags: (result, error, id) => [{ type: "Cars", id }],
        }),
    }),
})

export const {
    useGetCarsQuery,
    useGetCarByIdQuery,
    useSearchCarsMutation,
    useGetCarHistoryQuery,
} = carsApi
