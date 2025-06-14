import { Schema, model } from 'mongoose';

const companySchema = new Schema({
  company_name: { type: String, required: true },
  company_legal_name: { type: String, required: true },
  company_logo: { type: String },
  company_address: { type: String, required: true },
  primary_contact_number: { type: String, required: true },
  office_contact_number: { type: String },
  email: { type: String, required: true },
  website: { type: String },
  gst_no: { type: String },
  ip_whitelisting: { type: [String], default: [] },
  message_tokens: { type: [String], default: [] },
}, { timestamps: true });

export const Company = model('Company', companySchema); 