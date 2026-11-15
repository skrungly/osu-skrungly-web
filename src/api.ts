export type JsonRequestMethod = "POST" | "PUT" | "DELETE"
export type HttpRequestMethod = "GET" | JsonRequestMethod

type TokenType = "access" | "refresh"

type QueryParameters = {
  [K in string]?: { toString: () => string }
}

export interface PaginationOptions {
  limit?: number
  page?: number
}

export enum GameMode {
  Osu = 0,
  Taiko = 1,
  Catch = 2,
  Mania = 3,

  OsuRelax = 4,
  TaikoRelax = 5,
  CatchRelax = 6,

  OsuAutopilot = 8,
}

export interface PlayerStats {
  id: number
  mode: GameMode
  tscore: number
  rscore: number
  pp: number
  plays: number
  playtime: number
  acc: number
  max_combo: number
  total_hits: number
  replay_views: number
  xh_count: number
  x_count: number
  sh_count: number
  s_count: number
  a_count: number
}

export interface Player {
  id: number
  name: string
  safe_name: string
  priv: number
  country: string
  creation_time: number
  latest_activity: number
  preferred_mode: GameMode
  userpage_content: string

  stats: Record<GameMode, PlayerStats>
  online: boolean
}

export enum BeatmapStatus {
  Pending = 0,
  Ranked = 2,
  Approved = 3,
  Qualified = 4,
  Loved = 5,
}

export interface Beatmap {
  id: number
  set_id: number
  status: BeatmapStatus,
  md5: string,
  artist: string,
  title: string,
  version: string
  creator: string
  filename: string
  last_update: string
  total_length: number
  max_combo: number
  frozen: boolean
  plays: number
  passes: number
  mode: number
  bpm: number
  cs: number
  ar: number
  od: number
  hp: number
  diff: number

  popularity?: number
}

type ScoreGrade = "X" | "XH" | "S" | "SH" | "A" | "B" | "C" | "D" | "F"

export enum ScoreStatus {
  Failed = 0,
  Submitted = 1,
  Best = 2,
}

export interface Score {
  id: number
  map_md5: string
  score: number
  pp: number
  acc: number
  max_combo: number
  mods: number
  n300: number
  n100: number
  n50: number
  nmiss: number
  ngeki: number
  nkatu: number
  grade: ScoreGrade
  status: ScoreStatus
  mode: GameMode
  play_time: string
  time_elapsed: number
  client_flags: number
  userid: number
  perfect: boolean
  online_checksum: string

  beatmap: Beatmap
  player: Player
}

export type ScoreSortOption = "recent" | "score" | "pp" | "combo" | "length" | "frontpage"

export interface ScoreQuery extends PaginationOptions, QueryParameters {
  player?: number
  sort?: ScoreSortOption
  mode?: GameMode
  status?: ScoreStatus
}

export type TaskState = "FAILURE" | "PENDING" | "RECEIVED" | "RETRY" | "REVOKED" | "STARTED" | "SUCCESS"

export interface Task {
  id: string
  state: TaskState
  current: number | null
  total: number | null
  status: string
  result: string
}

export interface GlobalStats {
  tscore: number
  rscore: number
  pp: number
  plays: number
  playtime: number
  total_hits: number
}

function getCookie(name: string): string | null {
  const parts = `  ${document.cookie}`.split(`  ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(' ').shift() ?? null
  }

  return null
}

async function request(method: "GET", endpoint: string, data?: URLSearchParams, csrf?: TokenType): Promise<Response>
async function request(method: JsonRequestMethod, endpoint: string, data?: unknown, csrf?: TokenType): Promise<Response>
async function request(method: HttpRequestMethod, endpoint: string, data?: unknown, csrf?: TokenType): Promise<Response> {
  var url = `${import.meta.env.VITE_SKRUNGLY_API_URL}/${endpoint}`
  const options: RequestInit = {
    credentials: import.meta.env.DEV ? "include" : "same-origin",
    method: method,
  }

  options.headers = new Headers()

  if (csrf) {
    let token = getCookie(`csrf_${csrf}_token`)

    if (token) {
      options.headers.set("X-CSRF-TOKEN", token)
    }
  }

  // handle GET requests separately since they're a bit different
  if (method === "GET") {
    let paramString = (data as URLSearchParams).toString()
    url = `${url}?${paramString}`

  // now handle requests which involve sending data
  } else if (data) {
    // differentiate between multipart form data or JSON
    if (data instanceof FormData) {
      options.body = data
    } else {
      options.body = JSON.stringify(data)
      options.headers.set("Content-Type", "application/json")
    }
  }

  var response = await fetch(url, options)

  // send a refresh request if we're unauthorized due to expired tokens
  if (response.status == 401 && csrf == "access") {
    response = await refresh()

    let token = getCookie(`csrf_${csrf}_token`)

    if (response.ok && token) {
      options.headers.set("X-CSRF-TOKEN", token)
      response = await fetch(url, options)
    }
  }

  return response
}

export async function refresh() {
  return await request("POST", "/auth/refresh", null, "refresh")
}

export async function get(endpoint: string, params?: QueryParameters, csrf?: TokenType) {
  let data = new URLSearchParams()

  if (params) {
    for (let [key, value] of Object.entries(params)) {
      if (value) {
        data.set(key, value.toString())
      }
    }
  }

  return await request("GET", endpoint, data, csrf)
}

export async function post(endpoint: string, data: any, csrf: TokenType = "access") {
  return await request("POST", endpoint, data, csrf)
}

export async function put(endpoint: string, data: any, csrf: TokenType = "access") {
  return await request("PUT", endpoint, data, csrf)
}

// `delete` is a reserved keyword so let's export it separately later
async function delete_(endpoint: string, csrf: TokenType = "access") {
  return await request("DELETE", endpoint, null, csrf)
}

export async function login(name: string, password: string) {
  const data = {
    name: name,
    password: password,
    cookie: true,
  }

  return await post("/auth/login", data)
}

export async function logout() {
  return await delete_("/auth/logout")
}

export async function getIdentity(): Promise<string | null> {
  var response = await get("/auth/identity")

  if (response.ok) {
    return (await response.json()).identity
  }

  response = await refresh()

  if (response.ok) {
    return (await response.json()).identity
  }

  return null
}

export async function uploadFile(endpoint: string, file: string | Blob) {
  const formData = new FormData()
  formData.append('file', file)
  return await put(endpoint, formData)
}

export { delete_ as delete }
