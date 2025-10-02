#!/bin/bash

# Usage: ./updb.sh <mongodb-uri> [import|anonymize|all]
# Example: ./updb.sh "mongodb://localhost:27017/yourdbname" all

MONGO_URI=$1
# Default to 'all' if the second argument is not provided
ACTION=$2

if [ -z "$MONGO_URI" ]; then
  echo "Usage: $0 <mongodb-uri> [1|2]"
  exit 1
fi

run_import() {
  echo "--- Starting Database Import from backups ---"
  node importBackups.js "$MONGO_URI"
  echo "--- Import complete ---"
}

run_anonymize() {
  echo "--- Starting Database Anonymization ---"
  node anonymizeDb.js "$MONGO_URI"
  echo "--- Anonymization complete ---"
}

case "$ACTION" in
  1)
    run_import
    ;;
  2)
    run_anonymize
    ;;
  *)
    echo "Invalid action: '$ACTION'. Please use '1' to import or '2' to anonymize."
    exit 1
    ;;
esac

echo ""
echo "--- Database update process complete! ---"
