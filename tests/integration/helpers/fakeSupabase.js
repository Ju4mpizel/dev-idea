/**
 * Supabase simulado para las pruebas de integración. Reemplaza a
 * `createClient` de @supabase/supabase-js: las rutas API usan su código real
 * (auth, RPC y consultas encadenadas) contra este doble en memoria.
 *
 * - `fake.user`: usuario que devuelve auth.getUser() (null = token inválido).
 * - `fake.rpc[nombre] = (args) => ({ data, error })`: respuesta de cada RPC.
 * - `fake.tables[tabla] = (query) => ({ data, error })`: respuesta de cada
 *   consulta; `query` trae la operación, los filtros y el payload.
 * - `fake.calls`: registro de todo lo llamado, para verificarlo.
 */
export const fake = {
  user: null,
  rpc: {},
  tables: {},
  calls: [],
  reset() {
    this.user = null;
    this.rpc = {};
    this.tables = {};
    this.calls = [];
  },
};

function queryBuilder(table) {
  const query = { table, op: "select", filters: {}, payload: null };
  const builder = {
    select() {
      return builder;
    },
    insert(payload) {
      query.op = "insert";
      query.payload = payload;
      return builder;
    },
    update(payload) {
      query.op = "update";
      query.payload = payload;
      return builder;
    },
    upsert(payload) {
      query.op = "upsert";
      query.payload = payload;
      return builder;
    },
    delete() {
      query.op = "delete";
      return builder;
    },
    eq(column, value) {
      query.filters[column] = value;
      return builder;
    },
    order() {
      return builder;
    },
    single() {
      return builder;
    },
    maybeSingle() {
      return builder;
    },
    then(resolve, reject) {
      fake.calls.push({ type: "query", ...query });
      const handler = fake.tables[table];
      const result = handler ? handler(query) : { data: null, error: null };
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  return builder;
}

export function createFakeClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: fake.user },
        error: fake.user ? null : { message: "invalid token" },
      }),
    },
    rpc: async (name, args) => {
      fake.calls.push({ type: "rpc", name, args });
      const handler = fake.rpc[name];
      return handler ? handler(args) : { data: null, error: null };
    },
    from: (table) => queryBuilder(table),
  };
}

export const rpcCalls = (name) =>
  fake.calls.filter((c) => c.type === "rpc" && c.name === name);

/** Petición con (o sin) token de sesión. */
export function request(url, { method = "POST", body, token = "token-valido", raw } = {}) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  return new Request(`http://localhost${url}`, {
    method,
    headers,
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
}

export const USER = { id: "11111111-1111-4111-8111-111111111111", email: "estudiante@example.com" };
export const RUN_ID = "22222222-2222-4222-8222-222222222222";
