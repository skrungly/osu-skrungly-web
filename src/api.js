function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function formatRequestUrl(endpoint, params={}) {
  const paramString = new URLSearchParams(params).toString()
  return `${import.meta.env.VITE_API_URL}/${endpoint}?${paramString}`
}

export async function fetchFromAPI(endpoint, params) {
  const requestUrl = formatRequestUrl(endpoint, params)

  const response = await fetch(requestUrl)
  if (!response.ok) { throw new Error(response.status) }

  return await response.json()
}

export async function loginToAPI(name, password) {
  const params = {
    name: name,
    password: password,
    cookie: true,
  }

  const requestUrl = formatRequestUrl("/auth/login", params)
  const response = await fetch(requestUrl, {
    method: "POST",
    credentials: "same-origin",
  })

  return await response.json()
}

export async function getIdentity(refresh=true) {
  const authUrl = formatRequestUrl("/auth")
  const authResponse = await fetch(authUrl)

  if (authResponse.ok) {
    return (await authResponse.json()).logged_in_as
  }

  // if not authorised, see if we can refresh token
  const csrfRefreshToken = getCookie("csrf_refresh_token")
  if (refresh && authResponse.status == 401 && csrfRefreshToken !== null) {
    await fetch(
      formatRequestUrl("/auth/refresh", {cookie: true}), {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-CSRF-TOKEN": csrfRefreshToken,
        }
      }
    )

    // try once more upon refreshing (though api should
    // return the identity along with these responses!)
    return await getIdentity(refresh=false)
  }
}

export async function putUserEdits(params) {
  const identity = await getIdentity()
  if (identity === null) return

  const paramString = new URLSearchParams(params).toString()
  const requestUrl = `${import.meta.env.VITE_API_URL}/players/${identity}?${paramString}`
  console.log(paramString, requestUrl)

  const response = await fetch(requestUrl, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
  })

  return response
}
