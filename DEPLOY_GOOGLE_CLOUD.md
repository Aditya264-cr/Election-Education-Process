# Deploy to Google Cloud Run

This project is packaged as one Cloud Run service:

- Vite builds the React frontend.
- FastAPI serves the built frontend and the `/api/*` routes.

## Prerequisites

- A Google Cloud project with billing enabled.
- Google Cloud SDK installed, or use Google Cloud Shell.
- Docker/Cloud Build permissions on the selected project.

## Deploy

From the repository root:

```sh
gcloud auth login
gcloud config set project gen-lang-client-0532446756
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com
gcloud builds submit --config cloudbuild.yaml --substitutions _REGION=asia-south1,_SERVICE=election-education-process
```

Cloud Build will print the Cloud Run service URL when deployment completes.

To use a different region or service name, change `_REGION` and `_SERVICE` in the command above.
