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
  const requestUrl = formatRequestUrl("/auth/login")
  return await fetch(requestUrl, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      password: password,
      cookie: true,
    })
  })
}

export async function logoutOfAPI() {
  return await fetch(formatRequestUrl("/auth/logout"), {
    method: "DELETE",
    credentials: "same-origin",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    }
  })
}

export async function getIdentity() {
  const authUrl = formatRequestUrl("/auth/identity")
  const authResponse = await fetch(authUrl)

  if (authResponse.ok) {
    return (await authResponse.json()).identity
  }

  // if not authorised, see if we can refresh token
  const csrfRefreshToken = getCookie("csrf_refresh_token")
  if (authResponse.status == 401 && csrfRefreshToken !== null) {
    const refreshResponse = await fetch(
      formatRequestUrl("/auth/refresh"), {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-CSRF-TOKEN": csrfRefreshToken,
        }
      }
    )

    if (refreshResponse.ok) {
      return (await refreshResponse.json()).identity
    }
  }
}

export async function putUserEdits(params) {
  const identity = await getIdentity()
  if (identity === null) return

  const requestUrl = formatRequestUrl(`/players/${identity}`)
  const response = await fetch(requestUrl, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
    body: JSON.stringify(params)
  })

  return response
}

export async function putUserBanner(bannerData) {
  const identity = await getIdentity()
  if (identity === null) return

  const bannerResponse = await fetch(bannerData.value);
  const bannerBlob = await bannerResponse.blob();

  const formData = new FormData();
  formData.append('file', bannerBlob);

  const requestUrl = formatRequestUrl(`/players/${identity}/banner`)
  const response = await fetch(requestUrl, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
    body: formData
  })

  return response
}
