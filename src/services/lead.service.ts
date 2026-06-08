import { injectable } from "inversify";
import * as fs from "fs";
import * as path from "path";
import {
    RawLead,
    LeadInquiry,
    LeadProfile,
    LeadSummary,
    AnalysisResult,
    PropertyType,
} from "../entities/Lead";

const SOURCE_FILE = path.join(__dirname, "../data/sample_lead_data.json");
const OUTPUT_FILE = path.join(__dirname, "../data/analyzed_data.json");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PROPERTY_TYPES: PropertyType[] = ["rental", "sale"];

@injectable()
export class LeadService {

    async analyze(): Promise<AnalysisResult> {
        const raw = this.readSource();
        const valid: RawLead[] = [];
        const invalidRecords: { record: RawLead; reasons: string[] }[] = [];

        for (const record of raw) {
            const reasons = this.validate(record);
            if (reasons.length > 0) {
                invalidRecords.push({ record, reasons });
                continue;
            }
            valid.push(this.clean(record));
        }

        const profiles = this.buildProfiles(valid);
        const summary = this.buildSummary(profiles);
        const result: AnalysisResult = { summary, profiles, invalidRecords };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
        return result;
    }

    getLeadByPhone(phone: string): LeadProfile | null {
        const result = this.readAnalysis();
        const normalized = this.standardizePhone(phone);
        return result.profiles.find((p) => p.phone === normalized) ?? null;
    }

    getSummary(): LeadSummary {
        return this.readAnalysis().summary;
    }

    private validate(record: RawLead): string[] {
        const reasons: string[] = [];
        if (!record.phone || this.standardizePhone(record.phone).length < 10) {
            reasons.push("invalid phone number");
        }
        if (!record.email || !EMAIL_REGEX.test(record.email)) {
            reasons.push("invalid email");
        }
        if (!VALID_PROPERTY_TYPES.includes(record.property_type as PropertyType)) {
            reasons.push("invalid property_type");
        }
        if (typeof record.budget !== "number" || record.budget <= 0) {
            reasons.push("invalid budget");
        }
        return reasons;
    }

    private clean(record: RawLead): RawLead {
        return {
            ...record,
            name: record.name.trim(),
            email: record.email.trim().toLowerCase(),
            phone: this.standardizePhone(record.phone),
            property_type: record.property_type.trim().toLowerCase(),
            location: record.location.trim(),
            preferred_property_type: record.preferred_property_type.trim().toLowerCase(),
        };
    }

    // Phone is the unique key, so duplicates are merged into a single profile.
    private buildProfiles(records: RawLead[]): LeadProfile[] {
        const byPhone = new Map<string, LeadProfile>();
        for (const record of records) {
            const inquiry: LeadInquiry = {
                lead_id: record.lead_id,
                property_type: record.property_type as PropertyType,
                budget: record.budget,
                location: record.location,
                preferred_property_type: record.preferred_property_type,
                contact_date: record.contact_date,
                inquiry_notes: record.inquiry_notes,
            };
            const existing = byPhone.get(record.phone);
            if (existing) {
                existing.inquiries.push(inquiry);
            } else {
                byPhone.set(record.phone, {
                    phone: record.phone,
                    name: record.name,
                    email: record.email,
                    inquiries: [inquiry],
                });
            }
        }
        return Array.from(byPhone.values());
    }

    private buildSummary(profiles: LeadProfile[]): LeadSummary {
        const inquiries = profiles.flatMap((p) => p.inquiries);
        const locations = new Set(inquiries.map((i) => i.location));

        const rentals = inquiries.filter((i) => i.property_type === "rental");
        const sales = inquiries.filter((i) => i.property_type === "sale");

        const inquiriesByMonth: Record<string, number> = {};
        for (const inquiry of inquiries) {
            const month = inquiry.contact_date.slice(0, 7);
            inquiriesByMonth[month] = (inquiriesByMonth[month] ?? 0) + 1;
        }
        const monthCount = Object.keys(inquiriesByMonth).length;

        return {
            totalLeads: profiles.length,
            totalInquiries: inquiries.length,
            uniqueLocationCount: locations.size,
            uniqueLocations: Array.from(locations),
            averageBudgetByType: {
                rental: this.average(rentals.map((i) => i.budget)),
                sale: this.average(sales.map((i) => i.budget)),
            },
            averageInquiriesPerMonth: monthCount === 0 ? 0 : Math.round(inquiries.length / monthCount),
            inquiriesByMonth,
        };
    }

    private average(values: number[]): number {
        if (values.length === 0) return 0;
        return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
    }

    private standardizePhone(phone: string): string {
        const digits = String(phone).replace(/\D/g, "");
        return digits ? `+${digits}` : "";
    }

    private readSource(): RawLead[] {
        return JSON.parse(fs.readFileSync(SOURCE_FILE, "utf-8"));
    }

    private readAnalysis(): AnalysisResult {
        if (!fs.existsSync(OUTPUT_FILE)) {
            throw new Error("No analyzed data found. Run POST /analyze first.");
        }
        return JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    }
}
