# apydox bundled install

This is the simplest way to install the apydox project on your own server.

## Installing

### Step 1

Prepare your project's configuration:

TODO: Provide example and schema for configuration file

### Step 2

Install and run the project with one commmand (This will take a few minutes):

```bash
curl -fsSL https://raw.githubusercontent.com/freshwebio/apydox-bundled-install/master/install.sh | sh -s /absolute/path/to/config.json
```

### Prerequisites

- Server running Linux or OS X operating systems (Windows is not supported)
- Docker (Docker Engine 19.03.0+)
- Docker compose
- **No** existing web server or reverse proxy (e.g. nginx or apache) running on port 80

## Updating

To update your instance of apydox, simply re-run the install steps. If you want to update to a specific version make sure you specify that version in your config.json file.

## Limitations

The bundled installer does not work with Docker swarm mode and isn't horizontally scalable,
if you need something that can scale for larger teams use the more in-depth guides to install the apydox
for cloud-based serverless (e.g. AWS Lambda) and container orchestration (e.g. Amazon ECS) service deployments.
