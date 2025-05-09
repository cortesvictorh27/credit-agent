import { pgTable, text, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema from template
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Lead schema - users who have engaged with the chatbot
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type"),
  yearsInBusiness: numeric("years_in_business"),
  annualRevenue: numeric("annual_revenue"),
  requestedAmount: numeric("requested_amount"),
  loanPurpose: text("loan_purpose"),
  creditScore: integer("credit_score"),
  email: text("email"),
  phone: text("phone"),
  createdAt: text("created_at").notNull(),
  status: text("status").notNull().default("new"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  status: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Lending partners schema
export const lendingPartners = pgTable("lending_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  loanType: text("loan_type").notNull(),
  minLoanAmount: numeric("min_loan_amount").notNull(),
  maxLoanAmount: numeric("max_loan_amount").notNull(),
  minCreditScore: integer("min_credit_score").notNull(),
  minAnnualRevenue: numeric("min_annual_revenue").notNull(),
  minYearsInBusiness: numeric("min_years_in_business").notNull(),
  interestRateMin: numeric("interest_rate_min"),
  interestRateMax: numeric("interest_rate_max"),
  termLengthMin: integer("term_length_min"),
  termLengthMax: integer("term_length_max"),
  termUnit: text("term_unit"), // 'years', 'months', 'revolving'
  fundingTimeMin: integer("funding_time_min"),
  fundingTimeMax: integer("funding_time_max"),
  fundingTimeUnit: text("funding_time_unit"), // 'days', 'weeks', 'months'
  active: boolean("active").notNull().default(true),
});

export const insertLendingPartnerSchema = createInsertSchema(lendingPartners).omit({
  id: true,
});

export type InsertLendingPartner = z.infer<typeof insertLendingPartnerSchema>;
export type LendingPartner = typeof lendingPartners.$inferSelect;

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id"),
  role: text("role").notNull(), // 'user', 'assistant'
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Match schema for leads and partners
export const leadPartnerMatches = pgTable("lead_partner_matches", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  partnerId: integer("partner_id").notNull(),
  matchScore: numeric("match_score"),
  selected: boolean("selected").default(false),
  submitted: boolean("submitted").default(false),
  submittedAt: text("submitted_at"),
});

export const insertLeadPartnerMatchSchema = createInsertSchema(leadPartnerMatches).omit({
  id: true,
});

export type InsertLeadPartnerMatch = z.infer<typeof insertLeadPartnerMatchSchema>;
export type LeadPartnerMatch = typeof leadPartnerMatches.$inferSelect;
