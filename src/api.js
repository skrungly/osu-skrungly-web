function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export async function fetchFromAPI(endpoint, params) {
  const paramString = new URLSearchParams(params).toString()
  const requestUrl = `${import.meta.env.VITE_API_URL}/${endpoint}?${paramString}`

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

  const paramString = new URLSearchParams(params).toString()
  const requestUrl = `${import.meta.env.VITE_API_URL}/auth/login?${paramString}`

  const response = await fetch(requestUrl, {
    method: "POST",
    credentials: "same-origin",
  })

  return response.json()
}

export async function getIdentity() {
  const requestUrl = `${import.meta.env.VITE_API_URL}/auth`
  const response = await fetch(requestUrl)
  return response.json()
}

export async function changeName(name) {
  const identity = (await getIdentity()).logged_in_as
  console.log(identity)

  if (identity === null) return

  const paramString = new URLSearchParams({name: name}).toString()
  const requestUrl = `${import.meta.env.VITE_API_URL}/players/${identity}?${paramString}`
  console.log(paramString, requestUrl)

  const response = await fetch(requestUrl, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
  })
}
