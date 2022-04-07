#!/bin/bash

#installs the pre-requisites.
set -e

echo "Downloading pre-requisites install scripts"
wget --no-check-certificate --no-cache --no-cookies $artifactory_url_env/artifactory/libs-release-local/i18n/admin-i18n-bundle.zip -O $i18n_path/resident-i18n-bundle.zip
wget --no-check-certificate --no-cache --no-cookies $artifactory_url_env/artifactory/libs-release-local/i18n/admin-entity-spec-bundle.zip -O $entity_spec_path/resident-entity-spec-bundle.zip

echo "unzip pre-requisites.."
chmod 775 $i18n_path/*

cd $entity_spec_path
unzip -o resident-entity-spec-bundle.zip
cd $i18n_path
unzip -o resident-i18n-bundle.zip

echo "unzip pre-requisites completed."

exec "$@"
