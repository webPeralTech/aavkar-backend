import { Schema, model } from 'mongoose';

const companySchema = new Schema({
  company_name: { 
    type: String, 
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  company_legal_name: { 
    type: String, 
    required: [true, 'Company legal name is required'],
    trim: true,
    maxlength: [200, 'Company legal name cannot be more than 200 characters']
  },
  company_logo: { 
    type: String,
    // validate: {
    //   validator: function(v: string) {
    //     return !v || v.startsWith('http://') || v.startsWith('https://');
    //   },
    //   message: 'Company logo must be a valid URL'
    // }
  },
  company_address: { 
    type: String, 
    required: [true, 'Company address is required'],
    trim: true,
    maxlength: [500, 'Company address cannot be more than 500 characters']
  },
  primary_contact_number: { 
    type: String, 
    required: [true, 'Primary contact number is required'],
    trim: true,
    // validate: {
    //   validator: function(v: string) {
    //     return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(v);
    //   },
    //   message: 'Please enter a valid phone number'
    // }
  },
  office_contact_number: { 
    type: String,
    trim: true,
    // validate: {
    //   validator: function(v: string) {
    //     return !v || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(v);
    //   },
    //   message: 'Please enter a valid phone number'
    // }
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    // validate: {
    //   validator: function(v: string) {
    //     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    //   },
    //   message: 'Please enter a valid email address'
    // }
  },
  website: { 
    type: String,
    trim: true,
    // validate: {
    //   validator: function(v: string) {
    //     return !v || /^https?:\/\/.+/.test(v);
    //   },
    //   message: 'Please enter a valid website URL'
    // }
  },
  gst_no: { 
    type: String,
    trim: true,
    // validate: {
    //   validator: function(v: string) {
    //     return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
    //   },
    //   message: 'Please enter a valid GST number'
    // }
  },
  ip_whitelisting: { 
    type: [String], 
    default: [],
    // validate: {
    //   validator: function(v: string[]) {
    //     return v.every(ip => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip));
    //   },
    //   message: 'Please enter valid IP addresses'
    // }
  },
  message_tokens: { 
    type: [String], 
    default: [],
    // validate: {
    //   validator: function(v: string[]) {
    //     return v.every(token => token.length >= 8);
    //   },
    //   message: 'Message tokens must be at least 8 characters long'
    // }
  },
}, { 
  timestamps: true,
  // Ensure only one company can exist
  // statics: {
  //   async ensureSingleCompany() {
  //     const count = await this.countDocuments();
  //     if (count > 0) {
  //       throw new Error('Only one company can exist in the system');
  //     }
  //   }
  // }
});

// Add compound index for unique company name and email
// companySchema.index({ company_name: 1, email: 1 }, { unique: true });

export const Company = model('Company', companySchema); 