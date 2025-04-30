export async function fetchFromAPI(endpoint, params) {
    const paramString = new URLSearchParams(params).toString()
    const request_url = `${import.meta.env.VITE_API_URL}/${endpoint}?${paramString}`

    const response = await fetch(request_url)
    if (!response.ok) { throw new Error(response.status) }

    return await response.json()
}
