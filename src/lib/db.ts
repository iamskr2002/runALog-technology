import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let client: PrismaClient | undefined;

function getClient() {
  if (client) return client;

  const { env } = getCloudflareContext();
  const connectionString = (
    env as unknown as { DATABASE_URL: string }
  ).DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  client = new PrismaClient({
    adapter: new PrismaPg({ connectionString, maxUses: 1 }),
    log: ["error"],
  });

  return client;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = getClient();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});