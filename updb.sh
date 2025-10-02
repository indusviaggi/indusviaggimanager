#!/bin/bash

# Usage: ./updb.sh <mongodb-uri> [1|2|3]
# Example: ./updb.sh "mongodb://localhost:27017/yourdbname" 1

MONGO_URI=$1
# Default to 'all' if the second argument is not provided
ACTION=$2

if [ -z "$MONGO_URI" ]; then
  echo "Usage: $0 <mongodb-uri> [1|2|3]"
  exit 1
fi

run_import() {
  node importBackups.js "$MONGO_URI"
}

run_anonymize() {
  node anonymizeDb.js "$MONGO_URI"
}

run_export() {
  node exportBackups.js "$MONGO_URI"
}

case "$ACTION" in
  1)
    run_import
    ;;
  2)
    run_export
    ;;
  3)
    run_anonymize
    ;;
  *)
    echo "Invalid action: '$ACTION'. Please use '1' to import, '2' to export, or '3' to anonymize."
    exit 1
    ;;
esac
