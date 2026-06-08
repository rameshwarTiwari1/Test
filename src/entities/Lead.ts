export type PropertyType = "rental" | "sale";

export interface RawLead {
    lead_id: number;
    name: string;
    phone: string;
    email: string;
    property_type: string;
    budget: number;
    location: string;
    preferred_property_type: string;
    contact_date: string;
    inquiry_notes: string;
}

export interface LeadInquiry {
    lead_id: number;
    property_type: PropertyType;
    budget: number;
    location: string;
    preferred_property_type: string;
    contact_date: string;
    inquiry_notes: string;
}

// One profile aggregates every inquiry sharing the same phone number.
export interface LeadProfile {
    phone: string;
    name: string;
    email: string;
    inquiries: LeadInquiry[];
}

export interface AverageBudget {
    rental: number;
    sale: number;
}

export interface LeadSummary {
    totalLeads: number;
    totalInquiries: number;
    uniqueLocationCount: number;
    uniqueLocations: string[];
    averageBudgetByType: AverageBudget;
    averageInquiriesPerMonth: number;
    inquiriesByMonth: Record<string, number>;
}

export interface AnalysisResult {
    summary: LeadSummary;
    profiles: LeadProfile[];
    invalidRecords: { record: RawLead; reasons: string[] }[];
}
