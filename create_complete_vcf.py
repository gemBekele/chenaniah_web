#!/usr/bin/env python3
"""
Script to create a single VCF file from CSV with all contacts.
Includes detailed reporting to identify any missing entries.
"""

import csv
import re

def normalize_phone(phone):
    """Normalize phone number to standard format."""
    # Remove all spaces, dashes, and parentheses
    phone = re.sub(r'[\s\-\(\)]', '', str(phone))
    
    # Remove quotes if present
    phone = phone.strip('"\'')
    
    # If it starts with +251, keep it
    if phone.startswith('+251'):
        return phone
    # If it starts with 251 (without +), add +
    elif phone.startswith('251'):
        return '+' + phone
    # If it's a 9-digit number starting with 0, replace 0 with +251
    elif phone.startswith('0') and len(phone) == 10:
        return '+251' + phone[1:]
    # If it's a 9-digit number without leading 0, add +251
    elif len(phone) == 9 and phone.isdigit():
        return '+251' + phone
    # If it's a 12-digit number (251 + 9 digits), add +
    elif len(phone) == 12 and phone.startswith('251'):
        return '+' + phone
    # Otherwise, try to add +251 if it looks like a local number
    elif len(phone) >= 9:
        # If it doesn't start with +, assume it's local and add +251
        if not phone.startswith('+'):
            # Remove leading 0 if present
            if phone.startswith('0'):
                phone = phone[1:]
            return '+251' + phone
    
    return phone

def create_vcf_entry(name, phone):
    """Create a VCF entry for a contact."""
    # Clean up name (remove quotes, extra whitespace)
    name = name.strip().strip('"\'')
    # Replace newlines in name with spaces
    name = re.sub(r'\s+', ' ', name)
    
    # Normalize phone
    phone = normalize_phone(phone)
    
    # Create VCF entry
    vcf = f"""BEGIN:VCARD
VERSION:3.0
FN:{name}
TEL;TYPE=CELL:{phone}
END:VCARD
"""
    return vcf

def main():
    csv_file = 'accepted_list_decision.csv'
    output_file = 'all_contacts.vcf'
    
    # Read CSV and create contacts
    contacts = []
    skipped = []
    row_num = 0
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row_num += 1
            name = row.get('applicant_name', '').strip()
            phone = row.get('applicant_phone', '').strip()
            
            # Check if either is missing
            if not name or not phone:
                skipped.append((row_num, name, phone))
                continue
            
            contacts.append((name, phone))
    
    print(f"Found {len(contacts)} contacts")
    if skipped:
        print(f"Skipped {len(skipped)} rows (missing name or phone):")
        for row_num, name, phone in skipped:
            print(f"  Row {row_num}: name='{name}', phone='{phone}'")
    
    print(f"\nExpected: 158 contacts")
    print(f"Found: {len(contacts)} contacts")
    print(f"Difference: {158 - len(contacts)} contacts")
    
    if len(contacts) < 158:
        print("\n⚠️  WARNING: The CSV file contains fewer contacts than expected.")
        print("   Please verify the CSV file or add the missing entries.")
    
    # Create single VCF file
    with open(output_file, 'w', encoding='utf-8') as vcf_file:
        for name, phone in contacts:
            vcf_entry = create_vcf_entry(name, phone)
            vcf_file.write(vcf_entry)
    
    print(f"\n✅ Created {output_file} with {len(contacts)} contacts")

if __name__ == '__main__':
    main()

