export type RuntimeConfig = {
  apiBase: string
  assetsBase: string
  allowedOrigin?: string
  locale?: string
  currency?: string
}

const cfg: RuntimeConfig = {
  apiBase: '/api',
  assetsBase: '/static',
}

export function getConfig(){ return cfg }
export function getAssetsBase(){ return cfg.assetsBase }

export async function loadRuntimeConfig(){
  try {
    const res = await fetch('/config.json')
    if (!res.ok) return
    const data = await res.json()
    cfg.apiBase = data.apiBase || cfg.apiBase
    cfg.assetsBase = data.assetsBase || cfg.assetsBase
  } catch {}
}

