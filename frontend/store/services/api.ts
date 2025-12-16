import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
            headers.set("Content-Type", "application/json")
            return headers
        },
    }),
    // Reduce cache time to 60 seconds - data will be refetched after this
    keepUnusedDataFor: 60,
    // Always refetch when component mounts
    refetchOnMountOrArgChange: true,
    tagTypes: ["Cars", "Dealers", "Analytics"],
    endpoints: () => ({}),
})
