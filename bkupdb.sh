#!/bin/sh
TODAY=$(date +%F_%H-%M-%S)
mkdir -p managerBackups
cd managerBackups

for collection in "${COLLECTIONS[@]}"; do
  echo "$collection downloading..."
  curl --location --request POST "$URL" \
    --header "Content-Type: $TYPE" \
    --header "Access-Control-Request-Headers: *" \
    --header "api-key: $KEY" \
    --data-raw "{ \"collection\": \"$collection\", \"database\": \"test\", \"dataSource\": \"Cluster0\", \"skip\": 0, \"limit\": 50000 }" \
     > "$collection"_"$TODAY.json"
done