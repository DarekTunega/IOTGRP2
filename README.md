# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Environment Configuration

For proper API communication, create a `.env` file in the project root with the following:

```
VITE_BACKEND_URL=http://localhost:5000
```

Adjust this URL based on your deployment environment:
- For local development: `VITE_BACKEND_URL=http://localhost:5000` (or empty for relative paths)
- For production: `VITE_BACKEND_URL=https://api.yourdomain.com`
TODO
### Node-RED Gateway Configuration

If you're using the Node-RED gateway, set the `BACKEND_URL` environment variable in your Node-RED environment:

1. In Node-RED, go to Settings -> Environment Variables
2. Add a new variable named `BACKEND_URL` with your backend server URL (e.g., `http://localhost:5001`)
3. Save and restart Node-RED

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
