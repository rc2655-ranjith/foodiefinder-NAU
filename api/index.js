// Vercel Serverless Function Handler
// This file is a workaround since the current build setup creates a self-executing server
// Instead of deploying as serverless, we need to run on a platform that supports long-running servers

export default function handler(req, res) {
  res.status(503).json({ 
    error: "This app requires a long-running server and cannot run on Vercel serverless functions.",
    message: "Please deploy to Render, Railway, or Replit Deployments instead."
  });
}
