#!/usr/bin/env python3
"""
Script to check for duplicates and contacts with multiple phone numbers.
"""

import csv
from collections import defaultdict

def normalize_phone(phone):
    """Normalize phone number for comparison."""
    import re
    phone = re.sub(r'[\s\-\(\)]', '', str(phone))
    phone = phone.strip('"\'')
    
    # Normalize to format without +251 prefix for comparison
    if phone.startswith('+251'):
        return phone[4:]  # Remove +251
    elif phone.startswith('251'):
        return phone[3:]  # Remove 251
    elif phone.startswith('0'):
        return phone[1:]  # Remove leading 0
    return phone

def main():
    csv_file = 'accepted_list_decision.csv'
    
    # Track by name and phone
    contacts_by_name = defaultdict(list)
    contacts_by_phone = defaultdict(list)
    all_contacts = []
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row_num, row in enumerate(reader, start=2):  # Start at 2 (after header)
            name = row.get('applicant_name', '').strip().strip('"\'')
            phone = row.get('applicant_phone', '').strip().strip('"\'')
            
            if name and phone:
                normalized_phone = normalize_phone(phone)
                contacts_by_name[name].append((row_num, phone, normalized_phone))
                contacts_by_phone[normalized_phone].append((row_num, name))
                all_contacts.append((row_num, name, phone, normalized_phone))
    
    print(f"Total contacts: {len(all_contacts)}\n")
    
    # Check for duplicate names
    duplicate_names = {name: entries for name, entries in contacts_by_name.items() if len(entries) > 1}
    if duplicate_names:
        print("=" * 80)
        print("DUPLICATE NAMES (same name, possibly different phone numbers):")
        print("=" * 80)
        for name, entries in sorted(duplicate_names.items()):
            print(f"\nName: {name}")
            for row_num, phone, norm_phone in entries:
                print(f"  Row {row_num}: Phone = {phone} (normalized: {norm_phone})")
            # Check if they have different phone numbers
            unique_phones = set(norm_phone for _, _, norm_phone in entries)
            if len(unique_phones) > 1:
                print(f"  ⚠️  WARNING: This name has {len(unique_phones)} different phone numbers!")
    else:
        print("✓ No duplicate names found")
    
    # Check for duplicate phone numbers
    duplicate_phones = {phone: entries for phone, entries in contacts_by_phone.items() if len(entries) > 1}
    if duplicate_phones:
        print("\n" + "=" * 80)
        print("DUPLICATE PHONE NUMBERS (same phone, possibly different names):")
        print("=" * 80)
        for phone, entries in sorted(duplicate_phones.items()):
            print(f"\nPhone (normalized): {phone}")
            for row_num, name in entries:
                print(f"  Row {row_num}: Name = {name}")
            # Check if they have different names
            unique_names = set(name for _, name in entries)
            if len(unique_names) > 1:
                print(f"  ⚠️  WARNING: This phone number has {len(unique_names)} different names!")
    else:
        print("\n✓ No duplicate phone numbers found")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY:")
    print("=" * 80)
    print(f"Total contacts: {len(all_contacts)}")
    print(f"Unique names: {len(contacts_by_name)}")
    print(f"Unique phone numbers: {len(contacts_by_phone)}")
    print(f"Duplicate names: {len(duplicate_names)}")
    print(f"Duplicate phone numbers: {len(duplicate_phones)}")
    
    if duplicate_names or duplicate_phones:
        print("\n⚠️  Issues found that may need attention!")
    else:
        print("\n✓ No duplicates found - all contacts are unique!")

if __name__ == '__main__':
    main()






