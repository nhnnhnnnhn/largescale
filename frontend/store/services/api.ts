import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
            headers.set("Content-Type", "application/json")
            return headers
        },
    }),
    tagTypes: ["Cars", "Dealers", "Analytics"],
    endpoints: () => ({}),
})
