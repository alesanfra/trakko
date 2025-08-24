# Trakko Deployment Guide

## Compiled Binary Deployment

The Trakko application has been compiled into a single self-contained binary
that includes all dependencies and static files.

### Quick Start

1. **Build the binary:**
   ```bash
   deno task compile
   ```

2. **Run the binary:**
   ```bash
   ./trakko
   ```

### Binary Details

- **File**: `trakko` (98MB)
- **Includes**: All dependencies, static files, configuration, and runtime
- **Permissions**: Network, file system read/write, environment access, unstable
  KV
- **Platform**: Native binary for your current platform

### Environment Variables

- `PORT`: Server port (default: 8000)
- `DENO_KV_PATH`: KV database file path (optional)

### Example Usage

```bash
# Run on custom port
PORT=3000 ./trakko

# Run with custom KV database location
DENO_KV_PATH=/path/to/database.db ./trakko

# Run in background
nohup ./trakko > trakko.log 2>&1 &
```

### Production Deployment

For production deployment, you can:

1. Copy the `trakko` binary to your server
2. Set appropriate environment variables
3. Run with a process manager (systemd, pm2, etc.)
4. Set up reverse proxy (nginx, apache, etc.)

### System Service Example (systemd)

Create `/etc/systemd/system/trakko.service`:

```ini
[Unit]
Description=Trakko Event Management
After=network.target

[Service]
Type=simple
User=trakko
WorkingDirectory=/opt/trakko
ExecStart=/opt/trakko/trakko
Environment=PORT=8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl enable trakko
sudo systemctl start trakko
```

### Notes

- The binary is self-contained but still requires filesystem access for the KV
  database
- No external dependencies are needed on the target system
- The binary includes all static files and configurations
- Make sure the binary has execute permissions: `chmod +x trakko`
