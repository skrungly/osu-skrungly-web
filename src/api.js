function getCookie(name) {
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

async function request(method, endpoint, data, csrf) {
  var url = `${import.meta.env.VITE_API_URL}/${endpoint}`;
  const options = {
    credentials: "same-origin",
    method: method,
    headers: {},
  };

  if (csrf) options.headers["X-CSRF-TOKEN"] = getCookie(`csrf_${csrf}_token`);

  // handle GET requests separately since they're a bit different
  if (method === "GET" && data !== undefined) {
    let paramString = new URLSearchParams(data).toString();
    url = `${url}?${paramString}`;

  // now handle requests which involve sending data
  } else if (data !== undefined) {
    // differentiate between multipart form data or JSON
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
      options.headers["Content-Type"] = "application/json"
    }
  }

  return await fetch(url, options);
}

export async function get(endpoint, params, csrf) {
  return await request("GET", endpoint, params, csrf);
}

export async function post(endpoint, data, csrf = "access") {
  return await request("POST", endpoint, data, csrf);
}

export async function put(endpoint, data, csrf = "access") {
  return await request("PUT", endpoint, data, csrf);
}

// `delete` is a reserved keyword so let's export it separately later
async function delete_(endpoint, csrf = "access") {
  return await request("DELETE", endpoint, null, csrf);
}

export async function login(name, password) {
  const data = {
    name: name,
    password: password,
    cookie: true,
  };

  return await post("/auth/login", data, null);
}

export async function logout() {
  return await delete_("/auth/logout");
}

export async function identity() {
  const idResponse = await post("/auth/refresh", null, "refresh");

  if (idResponse.ok) {
    return (await idResponse.json()).identity;

  // code 401 means access token is expired
  } else if (idResponse.status == 401) {
    const refreshResponse = await post("/auth/refresh", null, "refresh");

    if (refreshResponse.ok) {
      return (await refreshResponse.json()).identity;
    }
  }

  return null;
}

export async function uploadFile(endpoint, file) {
  const formData = new FormData();
  formData.append('file', file);
  return await put(endpoint, formData);
}

export { delete_ as delete };
