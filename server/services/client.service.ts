import { eq, desc } from "drizzle-orm";
import { getDb } from "../db";
import {
  clients,
  clientPhones,
  loans,
  actions,
  osintResults,
} from "../db/schema";

/* ===============================
   CLIENTS
================================ */

export async function createClient(name: string) {
  const db = await getDb();

  const [client] = await db
    .insert(clients)
    .values({ name })
    .returning();

  return client;
}

export async function getClientById(clientId: string) {
  const db = await getDb();

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId));

  if (!client) return null;

  const phones = await db
    .select()
    .from(clientPhones)
    .where(eq(clientPhones.clientId, clientId));

  const clientLoans = await db
    .select()
    .from(loans)
    .where(eq(loans.clientId, clientId));

  const clientActions = await db
    .select()
    .from(actions)
    .where(eq(actions.clientId, clientId))
    .orderBy(desc(actions.createdAt));

  const [osint] = await db
    .select()
    .from(osintResults)
    .where(eq(osintResults.clientId, clientId));

  return {
    client,
    phones,
    loans: clientLoans,
    actions: clientActions,
    osint,
  };
}

export async function getAllClients() {
  const db = await getDb();

  return await db
    .select()
    .from(clients)
    .orderBy(desc(clients.createdAt));
}

/* ===============================
   PHONES
================================ */

export async function addPhone(clientId: string, phone: string) {
  const db = await getDb();

  const [result] = await db
    .insert(clientPhones)
    .values({ clientId, phone })
    .returning();

  return result;
}

/* ===============================
   LOANS
================================ */

export async function addLoan(data: {
  clientId: string;
  type: string;
  balance: number;
  emi: number;
  amountDue: number;
}) {
  const db = await getDb();

  const [loan] = await db.insert(loans).values(data).returning();

  return loan;
}

export async function getLoans(clientId: string) {
  const db = await getDb();

  return await db
    .select()
    .from(loans)
    .where(eq(loans.clientId, clientId));
}

/* ===============================
   ACTIONS (🔥 أهم حاجة)
================================ */

export async function addAction(data: {
  clientId: string;
  type: "call" | "paid" | "follow" | "no_answer";
  note?: string;
}) {
  const db = await getDb();

  const [action] = await db
    .insert(actions)
    .values(data)
    .returning();

  return action;
}

export async function getClientActions(clientId: string) {
  const db = await getDb();

  return await db
    .select()
    .from(actions)
    .where(eq(actions.clientId, clientId))
    .orderBy(desc(actions.createdAt));
}

/* ===============================
   OSINT
================================ */

export async function saveOSINT(data: {
  clientId: string;
  social?: string;
  workplace?: string;
  summary?: string;
  confidence?: number;
}) {
  const db = await getDb();

  const [result] = await db
    .insert(osintResults)
    .values(data)
    .returning();

  return result;
}

export async function getOSINT(clientId: string) {
  const db = await getDb();

  const [result] = await db
    .select()
    .from(osintResults)
    .where(eq(osintResults.clientId, clientId));

  return result;
    }
