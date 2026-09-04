# socal_frontend

SoCal Truck Trade — Next.js frontend.

## Dokploy

Build from the repo `Dockerfile`. Expose port **3000**.

Do **not** use `http://127.0.0.1:5000` in production — that is the frontend container itself.

| Variable | When | What to set |
| --- | --- | --- |
| `BACKEND_ORIGIN` | Runtime | Backend URL the **frontend server** can reach. Prefer the Dokploy internal service URL (`http://<backend-service>:5000`). The public `https://…sslip.io` backend URL also works. |
| `SOCKET_PUBLIC_URL` | Runtime | Public backend URL the **browser** uses for Socket.IO (the same HTTPS backend URL you open in the browser). |
| `NEXT_PUBLIC_API_BASE` | Build | `/api/v1` |

Leave backend `COOKIE_DOMAIN` empty so auth cookies stay on the frontend host.
