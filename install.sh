#!/bin/sh

# Grab all the resources we need to install the project.
installer_assets_uri="https://github.com/freshwebio/apydox-bundled-install/archive/master.zip"
installer_assets_root_dir="$HOME/.apydox-bundled-temp"
if [ ! -d $installer_assets_root_dir ]; then
  mkdir $installer_assets_root_dir
fi

if curl -L "$installer_assets_uri" --output "$installer_assets_root_dir/master.zip"; then
  cd $installer_assets_root_dir
  unzip -o master.zip
  installer_assets_dir="$installer_assets_root_dir/apydox-bundled-install-master"
  cd $installer_assets_dir
  # We don't need the install.sh in the bundle.
  rm install.sh
  # Copy the config file to the installer directory.
  if [ -n "$1" ]; then
    cp $1 .
  else
    echo "You must provide a config.json file in order to install apydox through the bundled installer"
    exit 1
  fi

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

  $deno_exe run --allow-read=$data_dir,$installer_assets_dir \
    --allow-write=$data_dir,$installer_assets_dir all.ts \
    --dataDir=$data_dir
fi
