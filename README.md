# socal_frontend

SoCal Truck Trade — Next.js frontend.

## Dokploy

Build from the repo `Dockerfile`. Expose port **3000**.

Set these as **build arguments** (and runtime env for `BACKEND_ORIGIN`):

| Variable | Example |
| --- | --- |
| `BACKEND_ORIGIN` | Internal backend URL, e.g. `http://socal-backend:5000` |
| `NEXT_PUBLIC_API_BASE` | `/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | Public backend URL used by the browser for Socket.IO |

`NEXT_PUBLIC_*` values are baked in at build time, so change them in Dokploy and rebuild — a restart is not enough.
