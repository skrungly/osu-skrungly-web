const API_URL = "https://api.skrungly.dev/v1/"

export async function fetchFromAPI(endpoint, params) {
    const request_url = API_URL + endpoint + "?" + new URLSearchParams(params).toString()

    const response = await fetch(request_url)
    if (!response.ok) { throw new Error(response.status) }

    return await response.json()
}
