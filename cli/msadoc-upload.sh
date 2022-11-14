#!/bin/bash

COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m' 
COLOR_RESET='\033[0m'

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
    printInfo "------- Configuration -------"
    printInfo "Server IP: $server";
    printInfo "Api key: $apikey";
    printInfo "File path: $filepath";
    printInfo "-----------------------------"
    echo ""
}

printInfo()
{
    echo -en "${COLOR_BLUE}" 
    echo -e "[INFO] $1"   
    echo -en "${COLOR_RESET}"
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
   printInfo "Filepath parameter defaults to './msadoc.json'";
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

if [[ "$response_code" -ne 201 ]] ; then
  echo -en "${COLOR_RED}"
  echo -e "[FAILURE] Failed with status code ${response_code}!"
  echo -en "${COLOR_RESET}"
  exit 2
fi

echo -en "${COLOR_GREEN}"
echo -e "[SUCCESS] Succeeded with status code ${response_code}!"
echo -en "${COLOR_RESET}"
exit 0
