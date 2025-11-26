#!/usr/bin/env python3
"""
Script to analyze CSV and identify all contacts, including multiline entries.
"""

import csv
import re

def main():
    csv_file = 'accepted_list.csv'
    
    # Read CSV with different methods to see what we get
    contacts = []
    skipped = []
    
    # Method 1: Standard CSV reader
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=2):  # Start at 2 because line 1 is header
            name = row.get('applicant_name', '').strip()
            phone = row.get('applicant_phone', '').strip()
            
            if not name and not phone:
                skipped.append(f"Line {idx}: Both name and phone empty")
                continue
            elif not name:
                skipped.append(f"Line {idx}: Missing name, phone={phone}")
                continue
            elif not phone:
                skipped.append(f"Line {idx}: Missing phone, name={name}")
                continue
            
            contacts.append((name, phone))
    
    print(f"Found {len(contacts)} contacts using standard CSV parser")
    
    # Method 2: Manual line-by-line parsing to catch multiline entries
    all_lines = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        print(f"\nTotal lines in file: {len(lines)}")
        print(f"Header line: {lines[0].strip()}")
        print(f"Last line: {lines[-1].strip()}")
        
        # Count non-empty data lines
        data_lines = [line for line in lines[1:] if line.strip()]
        print(f"Non-empty data lines (excluding header): {len(data_lines)}")
    
    # Show skipped entries
    if skipped:
        print(f"\nSkipped entries ({len(skipped)}):")
        for skip in skipped:
            print(f"  {skip}")
    
    # Show first and last few contacts
    print(f"\nFirst 3 contacts:")
    for i, (name, phone) in enumerate(contacts[:3], 1):
        print(f"  {i}. {name} - {phone}")
    
    print(f"\nLast 3 contacts:")
    for i, (name, phone) in enumerate(contacts[-3:], len(contacts)-2):
        print(f"  {i}. {name} - {phone}")

if __name__ == '__main__':
    main()


