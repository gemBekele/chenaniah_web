#!/usr/bin/env python3
"""
Detailed analysis of CSV to find all entries.
"""

import csv
import re

def main():
    csv_file = 'accepted_list.csv'
    
    # Read all lines first
    with open(csv_file, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    print(f"Total lines in file: {len(lines)}")
    print(f"Lines with content (non-empty): {len([l for l in lines if l.strip()])}")
    
    # Try parsing with CSV reader
    contacts = []
    row_num = 0
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row_num += 1
            name = row.get('applicant_name', '').strip()
            phone = row.get('applicant_phone', '').strip()
            
            # Check if either is missing
            if not name:
                print(f"Row {row_num}: Missing name, phone='{phone}'")
            if not phone:
                print(f"Row {row_num}: Missing phone, name='{name}'")
            
            if name and phone:
                contacts.append((row_num, name, phone))
            else:
                print(f"Row {row_num}: SKIPPED - name='{name}', phone='{phone}'")
    
    print(f"\nTotal contacts found: {len(contacts)}")
    print(f"Expected: 158")
    print(f"Missing: {158 - len(contacts)}")
    
    # Show all contacts with row numbers
    print(f"\nAll contacts (row number, name, phone):")
    for row_num, name, phone in contacts:
        print(f"  {row_num:3d}. {name[:40]:40s} - {phone}")

if __name__ == '__main__':
    main()








