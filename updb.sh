#!/bin/bash

# Usage: ./updb.sh <mongodb-uri>
# Example: ./updb.sh "mongodb://localhost:27017/yourdbname"

if [ -z "$1" ]; then
  echo "Usage: $0 <mongodb-uri>"
  exit 1
fi

node importBackups.js "$1"
