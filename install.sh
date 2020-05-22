#!/bin/sh

# Grab all the resources we need to install the project.
installer_assets_path=$(
  command curl -sSf https://github.com/freshwebio/apydox-bundled-install/releases |
  command grep -o "/freshwebio/apydox-bundled-install/releases/download/.*/install-assets\\.zip" |
  command head -n 1
)
if [ ! "$installer_assets_path" ]; then exit 1; fi
$installer_assets_uri="https://github.com${installer_assets_path}"
installer_assets_dir="$HOME/.apydox-bundled-temp"
curl --output "$installer_assets_dir/installer.zip" "$installer_assets_uri"

cd $installer_assets_dir
unzip installer.zip
# Copy the config file to the installer directory.
copy $1 .

# Install deno if it doesn't already exist.
deno_exe="$HOME/.deno/bin/deno"
if ! command -v $deno_exe >/dev/null; then
  echo "Installing deno ..."
  curl -fsSL https://deno.land/x/install/install.sh | sh
fi

# Set up data directory
data_dir=$HOME/.apydox-bundled
if [ ! -d $data_dir ]; then
  mkdir $data_dir
fi

# Run the deno script that does the heavy lifting
echo "Building and running apydox ..."

$deno_exe run --allow-read=$data_dir,$portal_dir,$api_dir,$installer_assets_dir \
  --allow-write=$data_dir,$portal_dir,$api_dir all.ts \
  --dataDir=$data_dir