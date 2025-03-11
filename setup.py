"""
Automated Deployment Script for Xclera Matrix Marketing System

This script automates the deployment process by:
1. Running the Hardhat deployment script
2. Parsing the output for contract address and wallet information
3. Updating the .env file with the deployment details
4. Running the Django management command to create the root user
"""

import subprocess
import os
import re
import shutil
from dotenv import load_dotenv

# Load current environment variables
load_dotenv()

# Function to run command and get output
def run_command(command, cwd=None, interactive=False):
    """
    Run a shell command and return the output
    
    Args:
        command: The command to execute
        cwd: The working directory to run the command in
        interactive: If True, allows user interaction with the subprocess
    """
    print(f"Executing: {command}")
    
    if interactive:
        # For interactive commands, connect directly to terminal
        process = subprocess.Popen(
            command,
            shell=True,
            cwd=cwd,
            stdin=None,      # Use parent's stdin (terminal)
            stdout=None,     # ::
            stderr=None      # ::
        )
        # Wait for the process to complete
        return_code = process.wait()
        if return_code != 0:
            print(f"Command exited with non-zero status: {return_code}")
            return None
        return True
    else:
        # For non-interactive commands, capture output as before
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True,
            cwd=cwd,
            text=True
        )
        
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            print(f"Error running command: {stderr}")
            return None
        
        return stdout

# Function to update .env file
def update_env_file(env_vars):
    """Update .env file with new environment variables"""
    # Create backup of current .env file
    if os.path.exists('.env'):
        shutil.copy2('.env', '.env.backup')
        print("Created backup of .env file as .env.backup")
    
    # Read current .env file
    env_content = []
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            env_content = f.readlines()
    
    # Update environment variables
    updated_keys = set()
    for i, line in enumerate(env_content):
        for key, value in env_vars.items():
            if line.startswith(f"{key}="):
                env_content[i] = f"{key}={value}\n"
                updated_keys.add(key)
    
    # Add any new variables that weren't already in the file
    for key, value in env_vars.items():
        if key not in updated_keys:
            env_content.append(f"{key}={value}\n")
    
    # Write updated content back to .env file
    with open('.env', 'w') as f:
        f.writelines(env_content)
    
    print("Updated .env file with new deployment information")

# Step 1: Run Hardhat deployment
print("Step 1: Running Hardhat deployment...")
deployment_output = run_command('npx hardhat run scripts/deploy.js --network localhost')

if not deployment_output:
    print("Deployment failed. Exiting.")
    exit(1)

print("\nDeployment output:")
print(deployment_output)

# Step 2: Parse deployment output
print("\nStep 2: Parsing deployment information...")
contract_address_match = re.search(r'Contract deployed to: (0x[a-fA-F0-9]{40})', deployment_output)
company_wallet_match = re.search(r'Company wallet: (0x[a-fA-F0-9]{40})', deployment_output)
root_user_match = re.search(r'Root user: (0x[a-fA-F0-9]{40})', deployment_output)

if not all([contract_address_match, company_wallet_match, root_user_match]):
    print("Failed to extract all required information from deployment output. Exiting.")
    exit(1)

contract_address = contract_address_match.group(1)
company_wallet = company_wallet_match.group(1)
root_user = root_user_match.group(1)

print(f"Contract address: {contract_address}")
print(f"Company wallet: {company_wallet}")
print(f"Root user: {root_user}")

# Step 3: Update .env file
print("\nStep 3: Updating .env file...")
new_env_vars = {
    'CONTRACT_ADDRESS': contract_address,
    'COMPANY_WALLET_ADDRESS': company_wallet,
    'ROOT_USER_ADDRESS': root_user
}
update_env_file(new_env_vars)

# Step 4: Create directory for ABI if it doesn't exist
print("\nStep 4: Ensuring ABI directory exists...")
abi_dir = os.path.join('xclera_backend', 'myapp', 'static')
if not os.path.exists(abi_dir):
    os.makedirs(abi_dir)
    print(f"Created directory: {abi_dir}")

# Step 5: Copy ABI file to Django static directory
print("\nStep 5: Copying ABI file to Django static directory...")
source_abi = os.path.join('deployments', 'contract_abi.json')
dest_abi = os.path.join(abi_dir, 'contract_abi.json')

if os.path.exists(source_abi):
    shutil.copy2(source_abi, dest_abi)
    print(f"Copied ABI file from {source_abi} to {dest_abi}")
else:
    print(f"Warning: ABI file not found at {source_abi}")

# Step 6: Run Django management command to create root user
print("\nStep 6: Creating root user...")
result = run_command('python xclera_backend/manage.py create_root_user', cwd='.', interactive=True)

if result is not None:
    print("Root user creation process completed")
else:
    print("Failed to create root user")

# Step 7: Run Django management command to setup initial data
print("\nStep 7: Setting up initial level data...")
result = run_command('python xclera_backend/manage.py setup_initial_data', cwd='.', interactive=True)

if result:
    print("Initial level data set up successfully")
else:
    print("Failed to set up initial level data")

print("\nDeployment process completed successfully!")
print("""
Next steps:
1. Make sure your Hardhat node is running: npx hardhat node
2. Start the Django server: python xclera_backend/manage.py runserver
3. Access the admin interface at: http://localhost:8000/admin/
""")