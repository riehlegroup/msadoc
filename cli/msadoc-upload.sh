#!/bin/bash

printHelp()
{
   echo ""
   echo "Usage: $0 -s SERVER_IP -k API_KEY [-f FILE_PATH]"
   echo ""
   echo -e "\t-s\t IP of the MSAdoc server to push to"
   echo -e "\t-k\t Api key for the MSAdoc server"
   echo -e "\t-f\t Filepath to the msadoc.config file (defaults to './msadoc.json')"
   exit 1 
}

printConfiguration()
{
    echo ""
    echo "------- Configuration -------"
    echo "Server IP: $server";
    echo "Api key: $apikey";
    echo "File path: $filepath";
    echo "-----------------------------"
    echo ""
}

while getopts ":s:k:f:" opt;
do
    case "${opt}" in
        s ) server="${OPTARG}"   ;;
        k ) apikey="${OPTARG}"   ;;
        f ) filepath="${OPTARG}" ;;
        ? ) helpFunction         ;;
    esac
done

# helpFunction in case required parameters are empty
if [ -z "$server" ]
then
   echo "Server parameter is missing";
   printHelp
fi

if [ -z "$apikey" ]
then
   echo "ApiKey parameter is missing";
   printHelp
fi

if [ -z "$filepath" ]
then
   echo "[INFO] ApiKey parameter defaults to './msadoc.json'";
   filepath="./msadoc.json"
fi

# All parameteres are there
printConfiguration

response_code="$(
    curl -X POST "${server}/service-docs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${apikey}" \
    -d @"$filepath" \
    --write-out '%{http_code}' \
    --silent \
    --output /dev/null
)"
echo "[INFO] Finished with status code ${response_code}!"