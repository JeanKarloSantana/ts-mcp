export type Role = "admin" | "support" | "analytics" | "readonly";
export type Permission =
  | "orders:read"
  | "products:read"
  | "tickets:read"
  | "metrics:read";

export type Principal = {
  id: string;
  roles: Role[];
  permissions: Set<Permission>;
};

type ApiKeyConfig = Record<string, { id: string; roles: Role[] }>;

const rolePermissions: Record<Role, Permission[]> = {
  admin: ["orders:read", "products:read", "tickets:read", "metrics:read"],
  support: ["orders:read", "products:read", "tickets:read"],
  analytics: ["orders:read", "products:read", "tickets:read", "metrics:read"],
  readonly: ["orders:read", "products:read"]
};

const fallbackApiKeys: ApiKeyConfig = {
  "admin-dev-key": { id: "local-admin", roles: ["admin"] },
  "support-dev-key": { id: "local-support", roles: ["support"] },
  "analytics-dev-key": { id: "local-analytics", roles: ["analytics"] }
};

function loadApiKeys(): ApiKeyConfig {
  const rawConfig = process.env.TS_MCP_API_KEYS;

  if (!rawConfig) {
    return fallbackApiKeys;
  }

  try {
    return JSON.parse(rawConfig) as ApiKeyConfig;
  } catch {
    console.error("TS_MCP_API_KEYS is invalid JSON. Falling back to local development keys.");
    return fallbackApiKeys;
  }
}

const apiKeys = loadApiKeys();

export function authenticate(apiKey?: string): Principal | null {
  if (!apiKey) {
    return null;
  }

  const config = apiKeys[apiKey];

  if (!config) {
    return null;
  }

  const permissions = new Set<Permission>();

  for (const role of config.roles) {
    for (const permission of rolePermissions[role]) {
      permissions.add(permission);
    }
  }

  return {
    id: config.id,
    roles: config.roles,
    permissions
  };
}

export function principalFromTransportAuth(extra: { authInfo?: { token: string; clientId: string; scopes: string[] } }): Principal | null {
  const byToken = authenticate(extra.authInfo?.token);

  if (byToken) {
    return byToken;
  }

  if (!extra.authInfo) {
    return null;
  }

  return {
    id: extra.authInfo.clientId,
    roles: ["readonly"],
    permissions: new Set(extra.authInfo.scopes.filter((scope): scope is Permission =>
      ["orders:read", "products:read", "tickets:read", "metrics:read"].includes(scope)
    ))
  };
}

export function assertPermission(principal: Principal | null, permission: Permission): Principal {
  if (!principal) {
    throw new AuthError("Missing or invalid API key.");
  }

  if (!principal.permissions.has(permission)) {
    throw new AuthError(`API key is not allowed to access ${permission}.`);
  }

  return principal;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}