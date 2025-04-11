#!/bin/bash
# This script automatically downloads and sets up the XMLUI starter kit for SQL examples

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print banner
echo -e "${GREEN}=========================================================="
echo -e "           XMLUI SQL Data Type Example Setup"
echo -e "==========================================================${NC}"

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Convert architecture to download format
if [ "$ARCH" == "x86_64" ]; then
    ARCH="amd64"
elif [ "$ARCH" == "aarch64" ] || [ "$ARCH" == "arm64" ]; then
    ARCH="arm64"
fi

# Set version and binary name
VERSION="v0.0.1"
BINARY_NAME="sqlite-server"

# Determine the starter kit URL based on OS
if [ "$OS" == "darwin" ]; then
    echo "Detected macOS system"
    STARTER_KIT_URL="https://github.com/JonUdell/xmlui-start/releases/download/$VERSION/starter-kit-mac.tar.gz"
    ARCHIVE_NAME="starter-kit-mac.tar.gz"
elif [ "$OS" == "linux" ]; then
    echo "Detected Linux system"
    STARTER_KIT_URL="https://github.com/JonUdell/xmlui-start/releases/download/$VERSION/starter-kit-linux.tar.gz"
    ARCHIVE_NAME="starter-kit-linux.tar.gz"
elif [[ "$OS" == *"mingw"* ]] || [[ "$OS" == *"msys"* ]] || [[ "$OS" == *"cygwin"* ]]; then
    echo "Detected Windows system"
    STARTER_KIT_URL="https://github.com/JonUdell/xmlui-start/releases/download/$VERSION/starter-kit-windows.zip"
    ARCHIVE_NAME="starter-kit-windows.zip"
    BINARY_NAME="sqlite-server.exe"
else
    echo -e "${RED}Unsupported operating system: $OS${NC}"
    exit 1
fi

# Check if sqlite-server exists
if [ ! -f "./$BINARY_NAME" ]; then
    echo -e "${YELLOW}sqlite-server not found - downloading automatically...${NC}"
    
    # Create a temporary directory
    TEMP_DIR=$(mktemp -d)
    echo "Created temporary directory for download: $TEMP_DIR"
    
    # Download the starter kit
    echo "Downloading XMLUI starter kit from $STARTER_KIT_URL"
    if command -v curl &> /dev/null; then
        curl -L "$STARTER_KIT_URL" -o "$TEMP_DIR/$ARCHIVE_NAME"
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to download using curl${NC}"
            exit 1
        fi
    elif command -v wget &> /dev/null; then
        wget "$STARTER_KIT_URL" -O "$TEMP_DIR/$ARCHIVE_NAME"
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to download using wget${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Error: Neither curl nor wget are available. Please install one of them.${NC}"
        exit 1
    fi
    
    # Extract the archive based on type
    echo "Extracting starter kit..."
    if [[ "$ARCHIVE_NAME" == *.tar.gz ]]; then
        tar -xzf "$TEMP_DIR/$ARCHIVE_NAME" -C "$TEMP_DIR"
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to extract tar.gz archive${NC}"
            exit 1
        fi
    elif [[ "$ARCHIVE_NAME" == *.zip ]]; then
        if command -v unzip &> /dev/null; then
            unzip "$TEMP_DIR/$ARCHIVE_NAME" -d "$TEMP_DIR"
            if [ $? -ne 0 ]; then
                echo -e "${RED}Failed to extract zip archive${NC}"
                exit 1
            fi
        else
            echo -e "${RED}Error: The 'unzip' command is not available. Please install it.${NC}"
            exit 1
        fi
    fi
    
    # Find and copy the sqlite-server binary
    echo "Searching for sqlite-server in extracted files..."
    SERVER_PATH=$(find "$TEMP_DIR" -name "$BINARY_NAME" -type f | head -n 1)
    
    if [ -z "$SERVER_PATH" ]; then
        echo -e "${RED}Error: Could not find sqlite-server in downloaded archive.${NC}"
        echo "You may need to download it manually from:"
        echo "https://github.com/JonUdell/xmlui-start/releases/tag/$VERSION"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    echo "Found sqlite-server at: $SERVER_PATH"
    echo "Copying to current directory..."
    cp "$SERVER_PATH" ./
    
    # Make the binary executable
    chmod +x "./$BINARY_NAME"
    
    # Clean up
    echo "Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
    
    echo -e "${GREEN}sqlite-server installed successfully.${NC}"
else
    echo -e "${GREEN}Found sqlite-server binary.${NC}"
    
    # Make the binary executable just in case
    chmod +x "./$BINARY_NAME"
fi

# Copy the xmlui standalone script if it doesn't exist
if [ ! -f "xmlui/xmlui-standalone.umd.js" ]; then
    echo "Setting up xmlui directory..."
    mkdir -p xmlui

    if [ -f "../xmlui/dist/xmlui-standalone.umd.js" ]; then
        echo "Copying XMLUI standalone script from dist..."
        cp ../xmlui/dist/xmlui-standalone.umd.js xmlui/
    else
        echo -e "${YELLOW}Warning: Could not find XMLUI standalone script in ../xmlui/dist/${NC}"
        echo "You'll need to manually copy it to xmlui/xmlui-standalone.umd.js"
    fi
fi

# Check if data.db exists, and if not, create it with sample data
if [ ! -f "data.db" ]; then
    echo "Creating sample SQLite database..."

    if command -v sqlite3 &> /dev/null; then
        sqlite3 data.db <<EOF
CREATE TABLE clients (id INTEGER PRIMARY KEY, name TEXT, email TEXT, phone TEXT);
INSERT INTO clients (name, email, phone) VALUES ('John Doe', 'john@example.com', '555-1234');
INSERT INTO clients (name, email, phone) VALUES ('Jane Smith', 'jane@example.com', '555-5678');
INSERT INTO clients (name, email, phone) VALUES ('Bob Johnson', 'bob@example.com', '555-9012');
EOF
        echo -e "${GREEN}Sample database created.${NC}"
    else
        echo -e "${YELLOW}Warning: sqlite3 command-line tool not found. Sample database not created.${NC}"
        echo "You'll need to create data.db manually or install sqlite3."
    fi
fi

# Run the sqlite-server
echo -e "${GREEN}Starting sqlite-server...${NC}"
echo "When the server is running, open your browser to the URL shown in the output"
echo "(typically http://localhost:8080)"
echo "Press Ctrl+C to stop the server."
echo ""

# Run the server
./$BINARY_NAME