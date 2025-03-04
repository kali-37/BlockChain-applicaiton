#!/usr/bin/env python
# test_db_connection.py - Test Django database connection to xclera

import os
import django
from django.db import connections
from django.db.utils import OperationalError
import sys 

# Setup Django environment
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0,os.path.dirname(current_dir))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "blockchain.settings")
django.setup()

def test_database_connection():
    """Test if the database connection is working properly."""
    try:
        # Attempt to connect to the database
        connection = connections['default']
        connection.cursor()
        
        # If no error is raised, the connection is successful
        print("✅ Successfully connected to the xclera database!")
        
        # Execute a simple query to ensure full functionality
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION();")
            version = cursor.fetchone()
            if version:
                print(f"MySQL version: {version[0]}")
            else:
                print("Could not retrieve MySQL version")
            
            # Create a test table
            print("Creating test table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS django_test (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    test_field VARCHAR(100) NOT NULL
                );
            """)
            
            # Insert a record
            print("Inserting test record...")
            cursor.execute("""
                INSERT INTO django_test (test_field) 
                VALUES ('This is a test from Django');
            """)
            
            # Retrieve the record
            cursor.execute("SELECT * FROM django_test;")
            results = cursor.fetchall()
            print(f"Retrieved {len(results)} records:")
            for row in results:
                print(f"  - ID: {row[0]}, Value: {row[1]}")
            
            # Drop the test table
            print("Dropping test table...")
            cursor.execute("DROP TABLE django_test;")
                
    except OperationalError as e:
        print(f"❌ Failed to connect to database: {e}")
        print("\nPossible issues:")
        print("1. MySQL service is not running")
        print("2. xclera_user doesn't have proper permissions")
        print("3. xclera database doesn't exist")
        print("4. mysqlclient Python package is not installed")
        
if __name__ == "__main__":
    test_database_connection()