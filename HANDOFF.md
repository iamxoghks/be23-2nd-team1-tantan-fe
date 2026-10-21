# Build Node.js security baseline (2026-10-22)

The deployment workflow now selects the latest Node.js 22 runtime and rejects a 22.x version below 22.23.4 before installing dependencies. Application dependencies and compatibility requirements are unchanged.

Validation: clean npm install and the existing Vite build passed on the signed official Node.js 22.23.4 binary. Workflow YAML and security-floor accept/reject cases passed. The build reported its existing chunk-size and Browserslist age warnings.

Next: review the PR before merging. A push to main runs the existing S3 sync with deletion and CloudFront invalidation. This is a build-tool update, not evidence that production serves requests with Node.js.

