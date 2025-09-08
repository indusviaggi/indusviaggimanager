#!/bin/sh
TODAY=$(date +%F_%H-%M-%S)
BACKUP_DIR="managerBackups"
mkdir -p "$BACKUP_DIR"

URL="${URL}"
KEY="${KEY}"
COLLECTIONS=("a" "b")

if [ -z "$URL" ] || [ -z "$KEY" ]; then
  echo "Error: URL and KEY environment variables must be set."
  exit 1
fi

for collection in "${COLLECTIONS[@]}"; do
  echo "Downloading collection: $collection..."
  # Use curl with 'application/ejson' headers to preserve BSON types
  curl --location --request POST "$URL/action/find" \
    --header 'Content-Type: application/ejson' \
    --header 'Accept: application/ejson' \
    --header "api-key: $KEY" \
    --data-raw "{ \"collection\": \"$collection\", \"database\": \"test\", \"dataSource\": \"Cluster0\", \"limit\": 50000 }" \
    > "$BACKUP_DIR/$collection"_"$TODAY.json"
done

echo "Backup completed successfully in directory: $BACKUP_DIR"